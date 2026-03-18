"use client"

import { useState, useMemo } from "react"
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Flag, 
  Tag, 
  ChevronDown, 
  Clock, 
  LayoutDashboard, 
  ListTodo, 
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Target,
  Database
} from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  dueDate?: string
  completed: boolean
  createdAt: string
}

interface TaskArchitectProps {
  records: any[]
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  theme: string
}

export default function TaskArchitect({ records = [], addItem, updateItem, deleteItem, theme }: TaskArchitectProps) {
  const tasks = useMemo(() => records.filter(r => r.type === "architect-task"), [records])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const glassCardStyle = theme === 'light'
    ? "bg-white/80 border border-gray-200 shadow-sm"
    : "bg-white/5 border border-white/10"

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.item_metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'pending' && !task.item_metadata?.completed) || 
                        (activeTab === 'completed' && task.item_metadata?.completed)
      return matchesSearch && matchesTab
    }).sort((a, b) => {
      const priorities = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorities[a.item_metadata?.priority as keyof typeof priorities] - priorities[b.item_metadata?.priority as keyof typeof priorities]
    })
  }, [tasks, searchQuery, activeTab])

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.item_metadata?.completed).length,
    pending: tasks.filter(t => !t.item_metadata?.completed).length,
    urgent: tasks.filter(t => t.item_metadata?.priority === 'urgent' && !t.item_metadata?.completed).length
  }

  const toggleTask = async (task: any) => {
    const isCompleted = !task.item_metadata?.completed
    await updateItem(task.id, { 
      item_metadata: { 
        ...task.item_metadata, 
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      } 
    })
    if (isCompleted) {
      toast.success("Task Synchronized! ⚡")
    }
  }

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10"
  }

  return (
    <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0a]'} text-white overflow-hidden p-8`}>
      {/* Header & Stats */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 uppercase flex items-center gap-4">
              <ListTodo className="h-10 w-10 text-blue-500" /> Task Architect
            </h1>
            <p className="text-gray-500 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Strategic execution engine</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="h-5 w-5" /> Initialize Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Network Total', value: stats.total, icon: Database, color: 'text-blue-500' },
            { label: 'Synchronized', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Active Process', value: stats.pending, icon: Clock, color: 'text-orange-500' },
            { label: 'Critical Path', value: stats.urgent, icon: AlertCircle, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-3xl ${glassCardStyle} flex items-center gap-6 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="h-16 w-16" />
              </div>
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black italic tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className={`mb-8 p-4 rounded-3xl ${glassCardStyle} flex flex-col md:flex-row gap-4 items-center justify-between`}>
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full max-w-md relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Objective Database..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-tight placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Task Grid/List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <Target className="h-16 w-16 mb-4" />
            <p className="font-black uppercase tracking-widest italic">No objectives detected in current matrix</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`group p-6 rounded-[2.5rem] ${glassCardStyle} hover:border-blue-500/30 transition-all flex flex-col md:flex-row items-center gap-6 relative overflow-hidden`}
            >
              {/* Checkbox */}
              <button 
                onClick={() => toggleTask(task)}
                className={`h-14 w-14 rounded-[1.5rem] border-2 flex items-center justify-center shrink-0 transition-all ${task.item_metadata?.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'border-white/10 hover:border-blue-500/50 text-transparent'}`}
              >
                <CheckCircle2 className="h-8 w-8" />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                  <h3 className={`text-xl font-black uppercase tracking-tight italic transition-all ${task.item_metadata?.completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                  {task.title}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest ${priorityColors[task.item_metadata?.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
                      {task.item_metadata?.priority}
                    </span>
                    {task.item_metadata?.dueDate && !task.item_metadata?.completed && new Date(task.item_metadata.dueDate) < new Date() && (
                      <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-red-600 text-white animate-pulse tracking-widest">
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
                {task.item_metadata?.description && (
                  <p className={`text-sm font-bold leading-relaxed mb-4 max-w-2xl ${task.item_metadata?.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                    {task.item_metadata.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                    <Tag className="h-3 w-3" /> {task.item_metadata?.category || 'General'}
                  </div>
                  {task.item_metadata?.dueDate && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500/70 uppercase">
                      <Calendar className="h-3 w-3" /> Due {new Date(task.item_metadata.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {task.item_metadata?.completedAt && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase">
                      <TrendingUp className="h-3 w-3" /> Synced {new Date(task.item_metadata.completedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteItem(task.id)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Priority Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none
                ${task.item_metadata?.priority === 'urgent' ? 'bg-red-500' : 
                  task.item_metadata?.priority === 'high' ? 'bg-orange-500' : 
                  'bg-blue-500'}`} 
              />
            </div>
          ))
        )}
      </div>

      {/* Initialize Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000cc] backdrop-blur-xl p-6">
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f0f0f] border border-white/10'} w-full max-w-xl rounded-[3rem] p-10 shadow-3xl animate-in zoom-in-95 duration-200`}>
            <div className="mb-10 text-center">
              <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                Architect New Objective
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/70 mt-2">Define your execution parameters</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              await addItem({
                type: "architect-task",
                title: fd.get("title"),
                category: "Executive",
                item_metadata: {
                  description: fd.get("description"),
                  priority: fd.get("priority"),
                  category: fd.get("category"),
                  dueDate: fd.get("dueDate"),
                  completed: false,
                  createdAt: new Date().toISOString()
                }
              })
              setShowAddModal(false)
              toast.success("Objective Initialized! 🎯")
            }} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Title Vector</label>
                <input 
                  required 
                  name="title" 
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40 border border-white/5 focus:border-blue-500'}`} 
                  placeholder="e.g. Expand Secure Matrix" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Objective Details</label>
                <textarea 
                  name="description" 
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-sm min-h-[100px] ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40 border border-white/5 focus:border-blue-500'}`} 
                  placeholder="Strategic implementation details..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Priority Class</label>
                  <select 
                    name="priority" 
                    className={`w-full p-5 rounded-2xl outline-none font-black uppercase tracking-widest text-[11px] ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40 border border-white/5 focus:border-blue-500'}`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium" selected>Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Sector</label>
                  <input 
                    name="category" 
                    className={`w-full p-5 rounded-2xl outline-none font-bold text-sm ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40 border border-white/5 focus:border-blue-500'}`} 
                    placeholder="e.g. Work, Core, Ops" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Deadline Matrix</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-sm ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40 border border-white/5 focus:border-blue-500'}`} 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-white/5 hover:bg-white/10 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  className="flex-3 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-2xl shadow-blue-900/40 active:scale-95 transition-all text-sm"
                >
                  Commit Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
