"use client"

import { useState, useEffect, useCallback } from "react"
import type { TodoItem, TodoFilter, TodoSort, TodoStatus, TodoPriority } from "@/types/secure-database"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export function useTodo() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TodoFilter>({})
  const [sort, setSort] = useState<TodoSort>({ field: "dueDate", direction: "asc" })
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("secure_todos")
        .select("*")
        .order("created_at", { ascending: false })

      if (error && error.code !== "42P01") throw error

      if (!data || data.length === 0) {
          const stored = typeof window !== 'undefined' ? localStorage.getItem("slh_custom_todos") : null
          if (stored) {
              const localTodos: TodoItem[] = JSON.parse(stored)
              if (localTodos.length > 0) {
                  console.log(`Migrating ${localTodos.length} tasks to Cloud...`)
                  const payloads = localTodos.map(t => ({
                      user_id: user.id,
                      title: t.title,
                      notes: t.notes || "",
                      priority: t.priority || "medium",
                      status: t.status || "active",
                      due_date: t.dueDate,
                      source_database: t.sourceDatabase,
                      source_record_id: t.sourceRecordId,
                      source_field_name: t.sourceFieldName,
                      category: t.category,
                      tags: t.tags || [],
                      subtasks: t.subtasks || [],
                      created_at: t.created || new Date().toISOString()
                  }))
                  
                  await supabase.from("secure_todos").insert(payloads)
                  localStorage.removeItem("slh_custom_todos")
                  // Re-fetch now that they are in DB
                  fetchData()
                  return
              }
          }
          setTodos([])
      } else {
          // Map DB snake_case to UI camelCase
          const mapped = data.map(t => ({
              ...t,
              id: t.id,
              dueDate: t.due_date,
              lastUpdated: t.updated_at,
              sourceDatabase: t.source_database,
              sourceRecordId: t.source_record_id,
              sourceFieldName: t.source_field_name,
              created: t.created_at
          })) as unknown as TodoItem[]
          
          setTodos(mapped)
          updateCategoriesAndTags(mapped)
      }
    } catch (error: any) {
      console.error("Critical Task Engine Fault:", error)
      const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      toast.error(`Task Sync Fault: ${errorMsg}`)
      
      // Safety fallback
      const stored = typeof window !== 'undefined' ? localStorage.getItem("slh_custom_todos") : null
      if (stored) {
          try { setTodos(JSON.parse(stored)) } catch(e) {}
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateCategoriesAndTags = (todoItems: TodoItem[]) => {
    const uniqueCategories = new Set<string>()
    const uniqueTags = new Set<string>()
    todoItems.forEach((todo) => {
      if (todo.category) uniqueCategories.add(todo.category)
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach((tag) => uniqueTags.add(tag))
      }
    })
    setCategories(Array.from(uniqueCategories))
    setTags(Array.from(uniqueTags))
  }

  const addTodo = async (
    todo: Omit<TodoItem, "id" | "created" | "lastUpdated" | "status" | "tags"> & { tags?: string[] },
  ) => {
    if (!user) return
    
    try {
        const payload = {
            user_id: user.id,
            title: todo.title,
            notes: todo.notes || "",
            priority: todo.priority || "medium",
            status: "active",
            due_date: todo.dueDate,
            source_database: todo.sourceDatabase,
            source_record_id: todo.sourceRecordId,
            source_field_name: todo.sourceFieldName,
            category: todo.category,
            tags: todo.tags || [],
            subtasks: todo.subtasks || []
        }

        const { data, error } = await supabase
            .from("secure_todos")
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        
        toast.success("Todo synced across devices")
        fetchData()
        return data as unknown as TodoItem
    } catch (error: any) {
        toast.error("Failed to add todo: " + error.message)
    }
  }

  const updateTodo = async (updatedTodo: TodoItem) => {
    if (!user) return
    try {
        const { error } = await supabase
            .from("secure_todos")
            .update({
                title: updatedTodo.title,
                notes: updatedTodo.notes,
                priority: updatedTodo.priority,
                status: updatedTodo.status,
                due_date: updatedTodo.dueDate,
                category: updatedTodo.category,
                tags: updatedTodo.tags,
                subtasks: updatedTodo.subtasks,
                updated_at: new Date().toISOString()
            })
            .eq("id", updatedTodo.id)

        if (error) throw error
        fetchData()
    } catch (error: any) {
        toast.error("Failed to update todo")
    }
  }

  const deleteTodo = async (id: string) => {
    try {
        await supabase.from("secure_todos").delete().eq("id", id)
        fetchData()
    } catch (error) {
        toast.error("Failed to delete todo")
    }
  }

  const updateTodoStatus = (id: string, status: TodoStatus) => {
      const todo = todos.find(t => t.id === id)
      if (todo) updateTodo({ ...todo, status })
  }

  const updateTodoPriority = (id: string, priority: TodoPriority) => {
    const todo = todos.find(t => t.id === id)
    if (todo) updateTodo({ ...todo, priority })
  }

  const getFilteredAndSortedTodos = () => {
    // Current filtering/sorting logic remains (it works on local state)
    let result = [...todos]
    if (filter.status && filter.status.length > 0) {
      result = result.filter((todo) => filter.status?.includes(todo.status))
    }
    if (filter.priority && filter.priority.length > 0) {
      result = result.filter((todo) => filter.priority?.includes(todo.priority))
    }
    if (filter.sourceDatabase && filter.sourceDatabase.length > 0) {
      result = result.filter((todo) => todo.sourceDatabase && filter.sourceDatabase?.includes(todo.sourceDatabase))
    }
    if (filter.category && filter.category.length > 0) {
      result = result.filter((todo) => todo.category && filter.category?.includes(todo.category))
    }
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((todo) => todo.tags.some((tag) => filter.tags?.includes(tag)))
    }
    if (filter.dateRange) {
      if (filter.dateRange.start) {
        const startDate = new Date(filter.dateRange.start).getTime()
        result = result.filter((todo) => todo.dueDate && new Date(todo.dueDate).getTime() >= startDate)
      }
      if (filter.dateRange.end) {
        const endDate = new Date(filter.dateRange.end).getTime()
        result = result.filter((todo) => todo.dueDate && new Date(todo.dueDate).getTime() <= endDate)
      }
    }
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.notes.toLowerCase().includes(query) ||
          (todo.category && todo.category.toLowerCase().includes(query)) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    result.sort((a, b) => {
      const field = sort.field
      if (field === "dueDate") {
        const aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        const bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      if (field === "priority") {
        const priorityOrder: Record<TodoPriority, number> = { urgent: 3, high: 2, medium: 1, low: 0 }
        const aValue = priorityOrder[a.priority] || 0
        const bValue = priorityOrder[b.priority] || 0
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      if (field === "created" || field === "lastUpdated") {
        const aValue = new Date(a[field]).getTime()
        const bValue = new Date(b[field]).getTime()
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      const aValue = String(a[field] || "")
      const bValue = String(b[field] || "")
      return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })
    return result
  }

  return {
    todos,
    filteredTodos: getFilteredAndSortedTodos(),
    filter,
    setFilter,
    sort,
    setSort,
    categories,
    tags,
    initialized,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
    updateTodoPriority,
    refresh: fetchData
  }
}
