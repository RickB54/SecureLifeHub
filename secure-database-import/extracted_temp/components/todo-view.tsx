"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  CheckCircle2,
  Circle,
  Clock,
  Edit,
  Filter,
  Flag,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  Calendar,
  DatabaseIcon,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useTodo } from "@/lib/use-todo"
import type { TodoItem, TodoPriority, TodoStatus } from "@/lib/types"
import { HelpDialog } from "./help-dialog"
import { TodoHelp } from "./help-content/todo-help"

interface TodoViewProps {
  databases: string[]
}

export function TodoView({ databases }: TodoViewProps) {
  const {
    filteredTodos,
    filter,
    setFilter,
    sort,
    setSort,
    categories,
    tags,
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
    updateTodoPriority,
  } = useTodo()

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [showEditTodo, setShowEditTodo] = useState<TodoItem | null>(null)
  const [showViewNote, setShowViewNote] = useState<TodoItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Form state for add/edit todo - moved outside of renderTodoForm to avoid hook errors
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<TodoPriority>("medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [category, setCategory] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [subtasks, setSubtasks] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)

  // Reset form state when editing a different todo or adding a new one
  useEffect(() => {
    if (showEditTodo) {
      setTitle(showEditTodo.title || "")
      setNotes(showEditTodo.notes || "")
      setPriority(showEditTodo.priority || "medium")
      setDueDate(showEditTodo.dueDate ? new Date(showEditTodo.dueDate) : undefined)
      setCategory(showEditTodo.category || "")
      setTagsInput(showEditTodo.tags?.join(", ") || "")
      setSubtasks(showEditTodo.subtasks?.map((st) => st.title).join("\n") || "")
    } else if (showAddTodo) {
      setTitle("")
      setNotes("")
      setPriority("medium")
      setDueDate(undefined)
      setCategory("")
      setTagsInput("")
      setSubtasks("")
    }
  }, [showEditTodo, showAddTodo])

  // Update search filter when search query changes
  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      searchQuery,
    }))
  }, [searchQuery, setFilter])

  // Update status filter when tab changes
  useEffect(() => {
    if (activeTab === "all") {
      setFilter((prev) => ({
        ...prev,
        status: undefined,
      }))
    } else if (activeTab === "active") {
      setFilter((prev) => ({
        ...prev,
        status: ["active", "in-progress"],
      }))
    } else if (activeTab === "completed") {
      setFilter((prev) => ({
        ...prev,
        status: ["completed"],
      }))
    } else if (activeTab === "archived") {
      setFilter((prev) => ({
        ...prev,
        status: ["archived"],
      }))
    }
  }, [activeTab, setFilter])

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    try {
      addTodo({
        title,
        notes,
        priority,
        dueDate: dueDate?.toISOString(),
        category,
        tags: tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()) : [],
        subtasks: subtasks
          ? subtasks
              .split("\n")
              .filter((line: string) => line.trim() !== "")
              .map((task: string) => ({
                id: Math.random().toString(36).substring(2, 9),
                title: task.trim(),
                completed: false,
              }))
          : [],
      })

      setShowAddTodo(false)
      toast({
        title: "Todo Added",
        description: "Your todo has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding todo:", error)
      toast({
        title: "Error",
        description: "There was a problem adding your todo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTodo = (e: React.FormEvent) => {
    e.preventDefault()

    if (!showEditTodo) return

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    try {
      updateTodo({
        ...showEditTodo,
        title,
        notes,
        priority,
        dueDate: dueDate?.toISOString(),
        category,
        tags: tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()) : [],
        subtasks: subtasks
          ? subtasks
              .split("\n")
              .filter((line: string) => line.trim() !== "")
              .map((task: string, index: number) => {
                // Try to preserve existing subtask IDs and completion status
                const existingSubtask = showEditTodo.subtasks?.[index]
                return {
                  id: existingSubtask?.id || Math.random().toString(36).substring(2, 9),
                  title: task.trim(),
                  completed: existingSubtask?.completed || false,
                }
              })
          : [],
      })

      setShowEditTodo(null)
      toast({
        title: "Todo Updated",
        description: "Your todo has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating todo:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your todo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id)
    toast({
      title: "Todo Deleted",
      description: "Your todo has been deleted successfully.",
    })
  }

  const handleToggleStatus = (todo: TodoItem) => {
    const newStatus: TodoStatus =
      todo.status === "active"
        ? "completed"
        : todo.status === "completed"
          ? "active"
          : todo.status === "in-progress"
            ? "completed"
            : "active"

    updateTodoStatus(todo.id, newStatus)
  }

  const handleToggleSubtask = (todoId: string, subtaskId: string, completed: boolean) => {
    const todo = filteredTodos.find((t) => t.id === todoId)
    if (!todo) return

    const updatedSubtasks =
      todo.subtasks?.map((subtask) => (subtask.id === subtaskId ? { ...subtask, completed } : subtask)) || []

    updateTodo({
      ...todo,
      subtasks: updatedSubtasks,
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-blue-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "archived":
        return <X className="h-5 w-5 text-gray-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const renderTodoForm = (isEdit: boolean) => {
    return (
      <form onSubmit={isEdit ? handleEditTodo : handleAddTodo} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <div className="relative">
            <ScrollArea className="h-[200px] border rounded-md">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes"
                className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
              />
            </ScrollArea>
            {notes.length > 100 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2 h-6 px-2 text-xs bg-background/80"
                onClick={() =>
                  setShowViewNote({
                    id: showEditTodo?.id || "preview",
                    title: title || "Preview",
                    notes,
                    priority: priority || "medium",
                    status: "active",
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    tags: [],
                  })
                }
              >
                View Full Note
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TodoPriority)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="relative">
              <Input
                id="dueDate"
                value={dueDate ? format(dueDate, "MMM d, yyyy") : ""}
                placeholder="Select due date"
                readOnly
                onClick={() => setShowCalendar(true)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="h-4 w-4" />
              </Button>

              {showCalendar && (
                <div className="absolute z-10 mt-1 bg-background border rounded-md shadow-md">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm font-medium">Select Date</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowCalendar(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date)
                      setShowCalendar(false)
                    }}
                    initialFocus
                  />
                  <div className="p-2 border-t flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDueDate(undefined)
                        setShowCalendar(false)
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="button" size="sm" onClick={() => setShowCalendar(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                {/* Allow custom category input */}
                <div className="p-2 border-t">
                  <Input
                    placeholder="Add new category"
                    value={!categories.includes(category) ? category : ""}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtasks">Subtasks (one per line)</Label>
          <ScrollArea className="h-[120px] border rounded-md">
            <Textarea
              id="subtasks"
              value={subtasks}
              onChange={(e) => setSubtasks(e.target.value)}
              placeholder="Enter subtasks, one per line"
              className="min-h-[120px] border-0 focus-visible:ring-0 resize-none"
            />
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (isEdit ? setShowEditTodo(null) : setShowAddTodo(false))}
          >
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Update" : "Add"} Todo</Button>
        </div>
      </form>
    )
  }

  const renderFilters = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {(["active", "in-progress", "completed", "archived"] as TodoStatus[]).map((status) => (
              <Badge
                key={status}
                variant={filter.status?.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setFilter((prev) => {
                    const currentStatus = prev.status || []
                    return {
                      ...prev,
                      status: currentStatus.includes(status)
                        ? currentStatus.filter((s) => s !== status)
                        : [...currentStatus, status],
                    }
                  })
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {(["low", "medium", "high", "urgent"] as TodoPriority[]).map((priority) => (
              <Badge
                key={priority}
                variant={filter.priority?.includes(priority) ? "default" : "outline"}
                className={`cursor-pointer ${getPriorityColor(priority)}`}
                onClick={() => {
                  setFilter((prev) => {
                    const currentPriority = prev.priority || []
                    return {
                      ...prev,
                      priority: currentPriority.includes(priority)
                        ? currentPriority.filter((p) => p !== priority)
                        : [...currentPriority, priority],
                    }
                  })
                }}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Database Source</Label>
          <div className="flex flex-wrap gap-2">
            {databases.map((db) => (
              <Badge
                key={db}
                variant={filter.sourceDatabase?.includes(db) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setFilter((prev) => {
                    const currentDb = prev.sourceDatabase || []
                    return {
                      ...prev,
                      sourceDatabase: currentDb.includes(db) ? currentDb.filter((d) => d !== db) : [...currentDb, db],
                    }
                  })
                }}
              >
                {db}
              </Badge>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={filter.category?.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setFilter((prev) => {
                      const currentCategory = prev.category || []
                      return {
                        ...prev,
                        category: currentCategory.includes(category)
                          ? currentCategory.filter((c) => c !== category)
                          : [...currentCategory, category],
                      }
                    })
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Check if tags exists and has length before rendering */}
        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filter.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setFilter((prev) => {
                      const currentTags = prev.tags || []
                      return {
                        ...prev,
                        tags: currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag],
                      }
                    })
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {filter.dateRange?.start
                      ? format(new Date(filter.dateRange.start), "MMM d, yyyy")
                      : "Select start date"}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filter.dateRange?.start ? new Date(filter.dateRange.start) : undefined}
                    onSelect={(date) => {
                      setFilter((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: date?.toISOString(),
                        },
                      }))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {filter.dateRange?.end ? format(new Date(filter.dateRange.end), "MMM d, yyyy") : "Select end date"}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filter.dateRange?.end ? new Date(filter.dateRange.end) : undefined}
                    onSelect={(date) => {
                      setFilter((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          end: date?.toISOString(),
                        },
                      }))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(filter.dateRange?.start || filter.dateRange?.end) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setFilter((prev) => ({
                  ...prev,
                  dateRange: undefined,
                }))
              }}
            >
              Clear Date Range
            </Button>
          )}
        </div>

        <div className="pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setFilter({})
              setActiveTab("all")
            }}
          >
            Clear All Filters
          </Button>
          <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">To-Do List</h2>
            <p className="text-muted-foreground">Manage your tasks and to-dos</p>
          </div>
        </div>
        <HelpDialog
          title="Todo List Help"
          sections={[{ id: "overview", title: "Overview", content: <TodoHelp /> }]}
          size="lg"
        />
      </div>

      <div className="flex justify-between items-center mt-4 mb-2">
        <div className="flex gap-2">
          <Button onClick={() => setShowAddTodo(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Todo</span>
          </Button>

          <Button variant="outline" onClick={() => setShowFilters(true)} className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {(filter.priority?.length ||
              filter.sourceDatabase?.length ||
              filter.category?.length ||
              filter.tags?.length ||
              filter.dateRange) && (
              <Badge variant="secondary" className="ml-1">
                {[
                  filter.priority?.length || 0,
                  filter.sourceDatabase?.length || 0,
                  filter.category?.length || 0,
                  filter.tags?.length || 0,
                  filter.dateRange ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={sort.field}
                  onValueChange={(value) => setSort((prev) => ({ ...prev, field: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                    <SelectItem value="lastUpdated">Last Updated</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="sourceDatabase">Database Source</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-between pt-2">
                  <Button
                    variant={sort.direction === "asc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort((prev) => ({ ...prev, direction: "asc" }))}
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={sort.direction === "desc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort((prev) => ({ ...prev, direction: "desc" }))}
                  >
                    Descending
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search todos..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No todos found</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowAddTodo(true)}>
                  Add Your First Todo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTodos.map((todo) => (
                  <Card key={todo.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-0 flex flex-row items-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -ml-2 mt-0.5"
                        onClick={() => handleToggleStatus(todo)}
                      >
                        {getStatusIcon(todo.status)}
                      </Button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3
                            className={`font-medium ${todo.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {todo.title}
                          </h3>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setShowEditTodo(todo)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteTodo(todo.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTodoStatus(todo.id, "active")}>
                                <Circle className="h-4 w-4 mr-2" />
                                Mark as Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTodoStatus(todo.id, "in-progress")}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTodoStatus(todo.id, "completed")}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTodoStatus(todo.id, "archived")}>
                                <X className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                            <Flag className="h-3 w-3 mr-1" />
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </Badge>

                          {todo.dueDate && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(todo.dueDate)}
                            </Badge>
                          )}

                          {todo.category && <Badge variant="secondary">{todo.category}</Badge>}

                          {todo.sourceDatabase && (
                            <Badge variant="outline">
                              <DatabaseIcon className="h-3 w-3 mr-1" />
                              {todo.sourceDatabase}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {todo.notes && (
                        <div className="mb-3">
                          <ScrollArea className="max-h-[100px] overflow-hidden">
                            <p className="text-sm text-muted-foreground line-clamp-5 whitespace-pre-wrap">
                              {todo.notes}
                            </p>
                          </ScrollArea>
                          {todo.notes.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-6 px-2 text-xs"
                              onClick={() => setShowViewNote(todo)}
                            >
                              View Full Note
                            </Button>
                          )}
                        </div>
                      )}

                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">
                              Subtasks ({todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length})
                            </Label>
                          </div>
                          <div className="space-y-1">
                            {todo.subtasks.map((subtask) => (
                              <div key={subtask.id} className="flex items-start gap-2">
                                <Checkbox
                                  checked={subtask.completed}
                                  onCheckedChange={(checked) => handleToggleSubtask(todo.id, subtask.id, !!checked)}
                                  className="mt-0.5"
                                />
                                <span
                                  className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {subtask.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    {todo.tags.length > 0 && (
                      <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
                        {todo.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Add Todo Dialog */}
      <Dialog open={showAddTodo} onOpenChange={setShowAddTodo}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Todo</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="p-4">{renderTodoForm(false)}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog open={!!showEditTodo} onOpenChange={() => setShowEditTodo(null)}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="p-4">{renderTodoForm(true)}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog open={!!showViewNote} onOpenChange={() => setShowViewNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{showViewNote?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4 whitespace-pre-wrap">{showViewNote?.notes}</div>
          </ScrollArea>
          <DialogFooter>
            {showViewNote?.sourceDatabase && (
              <div className="mr-auto flex items-center text-sm text-muted-foreground">
                <DatabaseIcon className="h-4 w-4 mr-1" />
                From: {showViewNote.sourceDatabase}
              </div>
            )}
            <Button onClick={() => setShowViewNote(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Filter Todos</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4">{renderFilters()}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

