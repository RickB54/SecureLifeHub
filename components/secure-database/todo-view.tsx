"use client"

import { useState } from "react"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Calendar as CalendarIcon, 
  Flag,
  Search,
  CheckCircle,
  Tag as TagIcon,
  ChevronsUp,
  AlertCircle,
  HelpCircle,
  EyeOff,
  Mic,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useTodo } from "@/hooks/use-todo"
import type { TodoItem, TodoPriority, TodoStatus } from "@/types/secure-database"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TodoViewProps {
  databases: string[]
  onOpenHelp?: (id: string) => void
}

export function TodoView({ databases, onOpenHelp }: TodoViewProps) {
  const {
    filteredTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
    filter,
    setFilter,
    sort,
    setSort
  } = useTodo()

  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [newTodo, setNewTodo] = useState<Partial<TodoItem>>({
      priority: 'medium',
      category: 'Other',
      title: '',
      notes: '',
      tags: []
  })

  const getPriorityInfo = (priority: TodoPriority) => {
    switch (priority) {
      case "urgent": return { color: "text-rose-400 bg-rose-400/10", icon: AlertCircle, label: "Urgent" }
      case "high": return { color: "text-amber-400 bg-amber-400/10", icon: ChevronsUp, label: "High" }
      case "medium": return { color: "text-blue-400 bg-blue-400/10", icon: Flag, label: "Medium" }
      default: return { color: "text-emerald-400 bg-emerald-400/10", icon: Flag, label: "Low" }
    }
  }

  const handleToggleStatus = (todo: TodoItem) => {
    const newStatus: TodoStatus = todo.status === "completed" ? "active" : "completed"
    updateTodoStatus(todo.id, newStatus)
  }

  const handleCreateTodo = () => {
      if (!newTodo.title) return
      addTodo(newTodo as any)
      setNewTodo({ priority: 'medium', category: 'Other', title: '', notes: '', tags: [] })
      setIsAddingTodo(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
        {/* Header Block */}
        <div className="p-8 space-y-6">
            <h1 className="text-xl font-black tracking-tight text-white italic uppercase">To-Do Calendar</h1>
            
            {/* Search Bar Row */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input 
                        placeholder="Search todos..." 
                        className="h-12 pl-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-xl text-sm font-bold"
                        value={filter.searchQuery || ''}
                        onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                    />
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-12 w-12 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10">
                        <EyeOff className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsFiltering(!isFiltering)}
                        className={cn("h-12 w-12 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10", isFiltering && "bg-indigo-500/10 border-indigo-500/30 text-indigo-400")}
                    >
                        <Filter className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenHelp?.("task-architect")}
                        className="h-12 w-12 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10"
                    >
                        <HelpCircle className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>
            </div>

            {/* Add New Todo Section */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500">
                <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/2 transition-all"
                    onClick={() => setIsAddingTodo(!isAddingTodo)}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500">{isAddingTodo ? '—' : '+'}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">Add New Todo</span>
                    </div>
                    {isAddingTodo ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>

                {isAddingTodo && (
                    <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Input 
                                    placeholder="Add a new todo..."
                                    className="h-12 bg-black/40 border-white/5 rounded-xl text-sm font-bold pl-5 pr-24"
                                    value={newTodo.title}
                                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                        <Mic className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        onClick={handleCreateTodo}
                                        className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-0"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority</label>
                                <Select value={newTodo.priority} onValueChange={(v: any) => setNewTodo({...newTodo, priority: v})}>
                                    <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-12 font-bold text-sm">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                                <Select value={newTodo.category} onValueChange={(v) => setNewTodo({...newTodo, category: v})}>
                                    <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-12 font-bold text-sm">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Due Date & Time</label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-12 w-full bg-black/40 border-white/10 rounded-xl justify-start text-left font-bold text-sm">
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {newTodo.dueDate ? format(new Date(newTodo.dueDate), "MM/dd/yyyy") : "mm/dd/yyyy"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#111] border-white/10">
                                            <Calendar 
                                                mode="single"
                                                selected={newTodo.dueDate ? new Date(newTodo.dueDate) : undefined}
                                                onSelect={(date) => setNewTodo({...newTodo, dueDate: date?.toISOString()})}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <div className="relative group flex-1">
                                        <Input type="time" className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm" />
                                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Assigned To</label>
                                <div className="relative">
                                    <Input placeholder="Enter assignee..." className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notes</label>
                                <div className="relative">
                                    <Textarea 
                                        placeholder="Additional notes..." 
                                        className="min-h-[140px] bg-black/40 border-white/10 rounded-2xl p-5 font-bold text-sm"
                                        value={newTodo.notes}
                                        onChange={(e) => setNewTodo({...newTodo, notes: e.target.value})}
                                    />
                                    <Button variant="ghost" size="icon" className="absolute right-4 bottom-4 h-10 w-10 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tags (comma-separated)</label>
                                <Input placeholder="Enter tags..." className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm px-5" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters & Sorting Section */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500">
                <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/2 transition-all"
                    onClick={() => setIsFiltering(!isFiltering)}
                >
                    <div className="flex items-center gap-3">
                         <span className="text-sm font-black text-white/90 italic uppercase tracking-widest">Filters & Sorting</span>
                    </div>
                    <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 p-0 h-auto" onClick={(e) => { e.stopPropagation(); setFilter({}); }}>Clear All Filters</Button>
                </div>

                {isFiltering && (
                    <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Date</label>
                                <div className="relative">
                                    <Input type="date" className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm px-4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Date</label>
                                <div className="relative">
                                    <Input type="date" className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm px-4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority</label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm text-gray-400">
                                        <SelectValue placeholder="All Priorities" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="urgent">Urgent Only</SelectItem>
                                        <SelectItem value="high">High +</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-sm text-gray-400">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            <Button 
                                className={cn("h-10 rounded-lg text-[10px] font-black uppercase tracking-widest px-5 gap-2", sort.field === 'created' ? "bg-blue-600 hover:bg-blue-700" : "bg-white/5 border border-white/10 text-gray-400")}
                                onClick={() => setSort({ field: 'created', direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                            >
                                Date Created {sort.field === 'created' && (sort.direction === 'desc' ? '↓' : '↑')}
                            </Button>
                            <Button 
                                className={cn("h-10 rounded-lg text-[10px] font-black uppercase tracking-widest px-5 gap-2", sort.field === 'dueDate' ? "bg-blue-600" : "bg-white/5 border border-white/10 text-gray-400")}
                                onClick={() => setSort({ field: 'dueDate', direction: 'asc' })}
                            >
                                Due Date
                            </Button>
                            <Button 
                                className={cn("h-10 rounded-lg text-[10px] font-black uppercase tracking-widest px-5 gap-2", sort.field === 'priority' ? "bg-blue-600" : "bg-white/5 border border-white/10 text-gray-400")}
                                onClick={() => setSort({ field: 'priority', direction: 'desc' })}
                            >
                                Priority
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Task List container */}
        <ScrollArea className="flex-1 px-8 pb-12">
            <div className="max-w-4xl space-y-3">
                {filteredTodos.map((todo) => {
                    const priority = getPriorityInfo(todo.priority)
                    const isCompleted = todo.status === "completed"
                    
                    return (
                        <div 
                            key={todo.id}
                            className={`group flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500 overflow-hidden relative
                                ${isCompleted 
                                    ? 'bg-white/2 border-white/5 opacity-40' 
                                    : 'bg-[#111] border-white/5 hover:border-blue-500/30 shadow-xl'
                                }`}
                        >
                            {/* Status Checkbox */}
                            <button 
                                onClick={() => handleToggleStatus(todo)}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all
                                    ${isCompleted 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                        : 'border-white/10 hover:border-blue-500/50 text-transparent'
                                    }`}
                            >
                                <CheckCircle className="h-5 w-5" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-lg font-bold transition-all ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-100'}`}>
                                    {todo.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-4 mt-2 overflow-hidden">
                                     <Badge variant="outline" className={`border-none px-2.5 py-1 font-black text-[9px] uppercase tracking-tighter rounded-lg ${priority.color}`}>
                                        <priority.icon className="h-3 w-3 mr-1.5" />
                                        {priority.label}
                                     </Badge>
                                     {todo.dueDate && (
                                         <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            {(() => {
                                                try { return format(new Date(todo.dueDate), "MMM d"); } catch(e) { return "N/A" }
                                            })()}
                                         </span>
                                     )}
                                     {todo.category && (
                                         <span className="flex items-center gap-1.5 text-[10px] text-blue-400 font-black uppercase tracking-tighter">
                                            <TagIcon className="h-3.5 w-3.5" />
                                            {todo.category}
                                         </span>
                                     )}
                                     <div className="flex-1" />
                                     <div className="hidden md:flex items-center gap-2 pr-2">
                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <User className="h-3 w-3 text-gray-600" />
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">Unassigned</span>
                                     </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-colors" onClick={() => deleteTodo(todo.id)}>
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-white hover:bg-white/5 rounded-2xl">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            {/* Background Glow for Urgent */}
                            {todo.priority === 'urgent' && !isCompleted && (
                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-rose-500 animate-pulse" />
                            )}
                        </div>
                    )
                })}

                {filteredTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mb-2">
                             <CheckCircle2 className="w-10 h-10 text-blue-500/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 italic uppercase">Mission Clearance Approved</h3>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">All strategic objectives have been neutralized.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    </div>
  )
}
