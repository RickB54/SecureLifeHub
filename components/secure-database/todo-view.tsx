"use client"

import { useState, useMemo } from "react"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Calendar, 
  Flag,
  Search,
  CheckCircle,
  Tag as TagIcon,
  ChevronsUp,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTodo } from "@/hooks/use-todo"
import type { TodoItem, TodoPriority, TodoStatus } from "@/types/secure-database"
import { format } from "date-fns"

interface TodoViewProps {
  databases: string[]
}

export function TodoView({ databases }: TodoViewProps) {
  const {
    filteredTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
  } = useTodo()

  const [searchQuery, setSearchQuery] = useState("")

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

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
        <div className="p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black tracking-tight text-white uppercase">Mission Tasks</h2>
                <div className="flex items-center gap-2">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="bg-white/5 border border-white/10 rounded-xl"
                        onClick={() => {}}
                    >
                        <Search className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-xl shadow-lg shadow-emerald-500/20"
                        onClick={() => {}}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Objective
                    </Button>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-black text-gray-400">{i}</span>
                        </div>
                    ))}
                 </div>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {filteredTodos.filter(t => t.status !== 'completed').length} Pending Operations
                 </p>
            </div>
        </div>

        <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-3">
                {filteredTodos.map((todo) => {
                    const priority = getPriorityInfo(todo.priority)
                    const isCompleted = todo.status === "completed"
                    
                    return (
                        <div 
                            key={todo.id}
                            className={`group flex items-center gap-5 p-5 rounded-3xl border transition-all duration-500 overflow-hidden relative
                                ${isCompleted 
                                    ? 'bg-white/2 border-white/5 opacity-60' 
                                    : 'bg-[#111] border-white/5 hover:border-emerald-500/30 shadow-xl'
                                }`}
                        >
                            {/* Status Checkbox */}
                            <button 
                                onClick={() => handleToggleStatus(todo)}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all
                                    ${isCompleted 
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                        : 'border-white/10 hover:border-emerald-500/50 text-transparent'
                                    }`}
                            >
                                <CheckCircle className="h-5 w-5" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-lg font-bold transition-all ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-100'}`}>
                                    {todo.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5 overflow-hidden">
                                     <Badge variant="outline" className={`border-none px-2 py-0.5 font-black text-[9px] uppercase tracking-tighter ${priority.color}`}>
                                        <priority.icon className="h-2.5 w-2.5 mr-1" />
                                        {priority.label}
                                     </Badge>
                                     {todo.dueDate && (
                                         <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(todo.dueDate), "MMM d")}
                                         </span>
                                     )}
                                     {todo.category && (
                                         <span className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-black uppercase tracking-tighter">
                                            <TagIcon className="h-3 w-3" />
                                            {todo.category}
                                         </span>
                                     )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
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
                        <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mb-2">
                             <CheckCircle2 className="w-10 h-10 text-emerald-500/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">All Clear</h3>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No active mission objectives found.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    </div>
  )
}
