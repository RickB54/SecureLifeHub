"use client"

import { useState, useEffect } from "react"
import type { TodoItem, TodoFilter, TodoSort, TodoStatus, TodoPriority } from "@/types/secure-database"

export function useTodo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [initialized, setInitialized] = useState(false)
  const [filter, setFilter] = useState<TodoFilter>({})
  const [sort, setSort] = useState<TodoSort>({ field: "dueDate", direction: "asc" })
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  // Load todos from localStorage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        const stored = localStorage.getItem("slh_custom_todos")
        let parsedTodos: TodoItem[] = []

        if (!stored) {
          setTodos([])
          localStorage.setItem("slh_custom_todos", JSON.stringify([]))
        } else {
          const parsed = JSON.parse(stored)
          if (!Array.isArray(parsed)) {
            setTodos([])
            localStorage.setItem("slh_custom_todos", JSON.stringify([]))
            return
          }
          parsedTodos = parsed
          setTodos(parsedTodos)
        }
        updateCategoriesAndTags(parsedTodos)
      } catch (error) {
        console.error("Error loading todos:", error)
        setTodos([])
      }
      setInitialized(true)
    }

    loadTodos()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "slh_custom_todos") {
        loadTodos()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

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

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
  }

  const addTodo = (
    todo: Omit<TodoItem, "id" | "created" | "lastUpdated" | "status" | "tags"> & { tags?: string[] },
  ) => {
    const now = new Date().toISOString()
    const newTodo: TodoItem = {
      id: generateId(),
      title: todo.title,
      notes: todo.notes || "",
      priority: todo.priority || "medium",
      status: "active",
      dueDate: todo.dueDate,
      created: now,
      lastUpdated: now,
      sourceDatabase: todo.sourceDatabase,
      sourceRecordId: todo.sourceRecordId,
      sourceFieldName: todo.sourceFieldName,
      category: todo.category,
      tags: todo.tags || [],
      subtasks: todo.subtasks || [],
    }

    setTodos((current) => {
      const updated = [...current, newTodo]
      localStorage.setItem("slh_custom_todos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })
    return newTodo
  }

  const updateTodo = (updatedTodo: TodoItem) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === updatedTodo.id ? { ...updatedTodo, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("slh_custom_todos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })
  }

  const deleteTodo = (id: string) => {
    setTodos((current) => {
      const updated = current.filter((todo) => todo.id !== id)
      localStorage.setItem("slh_custom_todos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })
  }

  const updateTodoStatus = (id: string, status: TodoStatus) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === id ? { ...todo, status, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("slh_custom_todos", JSON.stringify(updated))
      return updated
    })
  }

  const updateTodoPriority = (id: string, priority: TodoPriority) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === id ? { ...todo, priority, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("slh_custom_todos", JSON.stringify(updated))
      return updated
    })
  }

  const getFilteredAndSortedTodos = () => {
    let result = [...todos]
    // Filter logic... (same as original but with sli_ prefix for storage key check)
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
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
    updateTodoPriority,
  }
}
