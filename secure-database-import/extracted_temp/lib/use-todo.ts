"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { TodoItem, TodoFilter, TodoSort, TodoStatus, TodoPriority } from "./types"

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
        const stored = localStorage.getItem("customTodos")
        let parsedTodos: TodoItem[] = []

        if (!stored) {
          setTodos([])
          localStorage.setItem("customTodos", JSON.stringify([]))
        } else {
          const parsed = JSON.parse(stored)

          if (!Array.isArray(parsed)) {
            console.error("Invalid todos format - not an array")
            setTodos([])
            localStorage.setItem("customTodos", JSON.stringify([]))
            return
          }

          parsedTodos = parsed
          setTodos(parsedTodos)
        }

        // Extract unique categories and tags
        updateCategoriesAndTags(parsedTodos)
      } catch (error) {
        console.error("Error loading todos:", error)
        setTodos([])
        localStorage.setItem("customTodos", JSON.stringify([]))
      }

      setInitialized(true)
    }

    loadTodos()

    // Add storage event listener to handle changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "customTodos") {
        loadTodos()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Extract unique categories and tags
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

  // Add a new todo
  const addTodo = (
    todo: Omit<TodoItem, "id" | "created" | "lastUpdated" | "status" | "tags"> & { tags?: string[] },
  ) => {
    const now = new Date().toISOString()
    const newTodo: TodoItem = {
      id: uuidv4(),
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
      localStorage.setItem("customTodos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })

    return newTodo
  }

  // Update an existing todo
  const updateTodo = (updatedTodo: TodoItem) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === updatedTodo.id ? { ...updatedTodo, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("customTodos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })
  }

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos((current) => {
      const updated = current.filter((todo) => todo.id !== id)
      localStorage.setItem("customTodos", JSON.stringify(updated))
      updateCategoriesAndTags(updated)
      return updated
    })
  }

  // Update todo status
  const updateTodoStatus = (id: string, status: TodoStatus) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === id ? { ...todo, status, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("customTodos", JSON.stringify(updated))
      return updated
    })
  }

  // Update todo priority
  const updateTodoPriority = (id: string, priority: TodoPriority) => {
    setTodos((current) => {
      const updated = current.map((todo) =>
        todo.id === id ? { ...todo, priority, lastUpdated: new Date().toISOString() } : todo,
      )
      localStorage.setItem("customTodos", JSON.stringify(updated))
      return updated
    })
  }

  // Add or update a todo from a database record
  const syncTodoFromRecord = (
    databaseTitle: string,
    recordId: string,
    fieldName: string,
    notes: string,
    recordTitle: string,
  ) => {
    const now = new Date().toISOString()

    try {
      // Check if a todo already exists for this record field
      const existingTodoIndex = todos.findIndex(
        (todo) =>
          todo.sourceDatabase === databaseTitle &&
          todo.sourceRecordId === recordId &&
          todo.sourceFieldName === fieldName,
      )

      if (existingTodoIndex >= 0) {
        // Update existing todo
        const updatedTodos = [...todos]
        updatedTodos[existingTodoIndex] = {
          ...updatedTodos[existingTodoIndex],
          notes,
          lastUpdated: now,
        }

        setTodos(updatedTodos)
        localStorage.setItem("customTodos", JSON.stringify(updatedTodos))
        return updatedTodos[existingTodoIndex]
      } else {
        // Create new todo
        const newTodo: TodoItem = {
          id: uuidv4(),
          title: recordTitle,
          notes,
          priority: "medium",
          status: "active",
          created: now,
          lastUpdated: now,
          sourceDatabase: databaseTitle,
          sourceRecordId: recordId,
          sourceFieldName: fieldName,
          tags: [databaseTitle],
        }

        setTodos((current) => {
          const updated = [...current, newTodo]
          localStorage.setItem("customTodos", JSON.stringify(updated))
          updateCategoriesAndTags(updated)
          return updated
        })

        return newTodo
      }
    } catch (error) {
      console.error("Error syncing todo from record:", error)
      throw error
    }
  }

  // Apply filters and sorting to todos
  const getFilteredAndSortedTodos = () => {
    let result = [...todos]

    // Apply filters
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
        result = result.filter((todo) => {
          if (!todo.dueDate) return false
          return new Date(todo.dueDate).getTime() >= startDate
        })
      }

      if (filter.dateRange.end) {
        const endDate = new Date(filter.dateRange.end).getTime()
        result = result.filter((todo) => {
          if (!todo.dueDate) return false
          return new Date(todo.dueDate).getTime() <= endDate
        })
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

    // Apply sorting
    result.sort((a, b) => {
      const field = sort.field

      if (field === "dueDate") {
        const aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        const bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (field === "priority") {
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 }
        const aValue = priorityOrder[a.priority] || 0
        const bValue = priorityOrder[b.priority] || 0
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (field === "created" || field === "lastUpdated") {
        const aValue = new Date(a[field]).getTime()
        const bValue = new Date(b[field]).getTime()
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      // For string fields (title, category, sourceDatabase)
      const aValue = a[field] || ""
      const bValue = b[field] || ""
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
    syncTodoFromRecord,
  }
}

