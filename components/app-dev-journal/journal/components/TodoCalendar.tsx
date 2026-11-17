// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TodoItem, Priority, Category } from '../types';
import { 
  Check, X, Plus, ExternalLink, Calendar, HelpCircle, 
  AlertCircle, Clock, Tag, User, Filter, SortAsc, SortDesc,
  ChevronDown, ChevronUp, Minus, Eye, EyeOff, Search, Edit2, Save
} from 'lucide-react';
import SpeechToText from './SpeechToText';
import Help from './Help';
import DateField from './DateField';
import { formatDateTime } from '../dates';

interface TodoCalendarProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onNavigateToRecord: (projectId: string) => void;
}

const TodoCalendar = ({ todos, onToggleTodo, onDeleteTodo, onNavigateToRecord }: TodoCalendarProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'dateCreated' | 'dueDate' | 'priority'>('dateCreated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState<Category>('other');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoDueTime, setNewTodoDueTime] = useState('12:00');
  const [newTodoNotes, setNewTodoNotes] = useState('');
  const [newTodoAssignedTo, setNewTodoAssignedTo] = useState('');
  const [newTodoTags, setNewTodoTags] = useState('');
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TodoItem | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const startEditing = (todo: TodoItem) => {
    setEditingTodo(todo.id);
    setEditForm({ ...todo });
  };

  const saveEdit = () => {
    if (!editForm) return;

    // Update localStorage
    const currentTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    const updatedTodos = currentTodos.map((t: TodoItem) => 
      t.id === editForm.id ? editForm : t
    );
    localStorage.setItem('todos', JSON.stringify(updatedTodos));

    // Update state through the parent component
    const todoIndex = todos.findIndex(t => t.id === editForm.id);
    if (todoIndex !== -1) {
      todos[todoIndex] = editForm;
    }

    setEditingTodo(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (showDeleteConfirm === id) {
      onDeleteTodo(id);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(id);
      setTimeout(() => setShowDeleteConfirm(null), 3000);
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        content: newTodo.trim(),
        projectId: 'manual',
        projectName: 'Manual Entry',
        noteType: 'Manual Entry',
        dateCreated: new Date().toISOString(),
        completed: false,
        priority: newTodoPriority,
        category: newTodoCategory,
        dueDate: newTodoDueDate || undefined,
        dueTime: newTodoDueTime || '12:00',
        notes: newTodoNotes || undefined,
        assignedTo: newTodoAssignedTo || undefined,
        tags: newTodoTags ? newTodoTags.split(',').map(tag => tag.trim()) : []
      };

      // Update localStorage
      const currentTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      const updatedTodos = [todo, ...currentTodos];
      localStorage.setItem('todos', JSON.stringify(updatedTodos));

      // Update state through the parent component
      todos.unshift(todo);

      // Reset form
      setNewTodo('');
      setNewTodoPriority('medium');
      setNewTodoCategory('other');
      setNewTodoDueDate('');
      setNewTodoDueTime('12:00');
      setNewTodoNotes('');
      setNewTodoAssignedTo('');
      setNewTodoTags('');
      setShowNewTodoForm(false);
    }
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isNearDeadline = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) return false;
    
    const now = currentTime;
    const deadline = new Date(`${dueDate}T${dueTime || '12:00'}`);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return diffHours > 0 && diffHours <= 1;
  };

  const isPastDeadline = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) return false;
    
    const now = currentTime;
    const deadline = new Date(`${dueDate}T${dueTime || '12:00'}`);
    return now > deadline;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'bug': return 'text-red-400';
      case 'feature': return 'text-blue-400';
      case 'improvement': return 'text-green-400';
      case 'documentation': return 'text-purple-400';
      case 'work': return 'text-indigo-400';
      case 'personal': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTodos = todos
    .filter(todo => {
      // First filter out completed todos if hideCompleted is true
      if (hideCompleted && todo.completed) {
        return false;
      }

      // Then apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          todo.content.toLowerCase().includes(searchLower) ||
          todo.projectName.toLowerCase().includes(searchLower) ||
          todo.notes?.toLowerCase().includes(searchLower) ||
          todo.assignedTo?.toLowerCase().includes(searchLower) ||
          todo.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      const todoDate = new Date(todo.dateCreated);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      let matches = true;

      if (start && end) {
        matches = todoDate >= start && todoDate <= new Date(end.setHours(23, 59, 59, 999));
      } else if (start) {
        matches = todoDate >= start;
      } else if (end) {
        matches = todoDate <= new Date(end.setHours(23, 59, 59, 999));
      }

      if (selectedPriority && todo.priority !== selectedPriority) {
        matches = false;
      }

      if (selectedCategory && todo.category !== selectedCategory) {
        matches = false;
      }

      if (selectedTags.length > 0 && (!todo.tags || !selectedTags.every(tag => todo.tags?.includes(tag)))) {
        matches = false;
      }

      return matches;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dateCreated':
          comparison = new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else {
            const aTime = new Date(`${a.dueDate}T${a.dueTime || '12:00'}`).getTime();
            const bTime = new Date(`${b.dueDate}T${b.dueTime || '12:00'}`).getTime();
            comparison = aTime - bTime;
          }
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = (priorityOrder[a.priority || 'low'] || 3) - (priorityOrder[b.priority || 'low'] || 3);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedPriority('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Calculate completed todos count
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">To-Do Calendar</h2>
            {completedCount > 0 && (
              <span className="text-sm text-gray-400">
                ({completedCount} completed)
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search todos..."
              className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`p-2 rounded-lg ${
                hideCompleted ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={hideCompleted ? 'Show completed todos' : 'Hide completed todos'}
            >
              {hideCompleted ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              title="Filters"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              title="Help"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowNewTodoForm(!showNewTodoForm)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            {showNewTodoForm ? <Minus size={20} /> : <Plus size={20} />}
            Add New Todo
          </span>
          {showNewTodoForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showNewTodoForm && (
          <form onSubmit={handleAddTodo} className="space-y-4 p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new todo..."
                  className="w-full bg-gray-700 rounded-lg p-2 pr-12"
                />
                <div className="absolute right-2 top-1">
                  <SpeechToText
                    onTranscript={(text) => {
                      setNewTodo(prev => prev ? `${prev} ${text}` : text);
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as Priority)}
                  className="w-full bg-gray-700 rounded p-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value as Category)}
                  className="w-full bg-gray-700 rounded p-2"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="improvement">Improvement</option>
                  <option value="documentation">Documentation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                <div className="flex gap-2">
                  <DateField
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className="flex-1 bg-gray-700 rounded p-2"
                  />
                  <input
                    type="time"
                    value={newTodoDueTime}
                    onChange={(e) => setNewTodoDueTime(e.target.value)}
                    className="w-24 bg-gray-700 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <input
                  type="text"
                  value={newTodoAssignedTo}
                  onChange={(e) => setNewTodoAssignedTo(e.target.value)}
                  placeholder="Enter assignee..."
                  className="w-full bg-gray-700 rounded p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <div className="relative">
                  <textarea
                    value={newTodoNotes}
                    onChange={(e) => setNewTodoNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full bg-gray-700 rounded p-2 h-20 pr-12"
                  />
                  <div className="absolute right-2 top-2">
                    <SpeechToText
                      onTranscript={(text) => {
                        setNewTodoNotes(prev => prev ? `${prev} ${text}` : text);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTodoTags}
                  onChange={(e) => setNewTodoTags(e.target.value)}
                  placeholder="Enter tags..."
                  className="w-full bg-gray-700 rounded p-2"
                />
              </div>
            </div>
          </form>
        )}
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Filters & Sorting</h3>
            <button
              onClick={clearDateFilters}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DateField
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DateField
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | '')}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => toggleSort('dateCreated')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                sortBy === 'dateCreated' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              Date Created
              {sortBy === 'dateCreated' && (
                sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
              )}
            </button>
            <button
              onClick={() => toggleSort('dueDate')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                sortBy === 'dueDate' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              Due Date
              {sortBy === 'dueDate' && (
                sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
              )}
            </button>
            <button
              onClick={() => toggleSort('priority')}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                sortBy === 'priority' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              Priority
              {sortBy === 'priority' && (
                sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      {filteredTodos.length === 0 ? (
        <p className="text-gray-400 mt-4">
          {searchTerm 
            ? 'No todos match your search.'
            : startDate || endDate || selectedPriority || selectedCategory || selectedTags.length > 0
            ? 'No tasks found with the current filters.'
            : 'No tasks yet. Add a todo or check notes in your records to add them here.'}
        </p>
      ) : (
        <div className="space-y-2 mt-4">
          {filteredTodos.map((todo) => {
            const isNearDue = isNearDeadline(todo.dueDate, todo.dueTime);
            const isPast = isPastDeadline(todo.dueDate, todo.dueTime);
            const isExpanded = expandedNotes.has(todo.id);
            const isEditing = editingTodo === todo.id;
            
            if (isEditing && editForm) {
              return (
                <div key={todo.id} className="p-4 rounded-lg border border-blue-500 bg-gray-800">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Todo Content</label>
                      <div className="relative">
                        <textarea
                          value={editForm.content}
                          onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                          className="w-full bg-gray-700 rounded p-2 pr-12 min-h-[60px]"
                        />
                        <div className="absolute right-2 top-2">
                          <SpeechToText
                            onTranscript={(text) => {
                              setEditForm({ 
                                ...editForm, 
                                content: editForm.content ? `${editForm.content} ${text}` : text 
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                          className="w-full bg-gray-700 rounded p-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                          className="w-full bg-gray-700 rounded p-2"
                        >
                          <option value="work">Work</option>
                          <option value="personal">Personal</option>
                          <option value="bug">Bug</option>
                          <option value="feature">Feature</option>
                          <option value="improvement">Improvement</option>
                          <option value="documentation">Documentation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                        <div className="flex gap-2">
                          <DateField
                            value={editForm.dueDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                            className="flex-1 bg-gray-700 rounded p-2"
                          />
                          <input
                            type="time"
                            value={editForm.dueTime || '12:00'}
                            onChange={(e) => setEditForm({ ...editForm, dueTime: e.target.value })}
                            className="w-24 bg-gray-700 rounded p-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        <input
                          type="text"
                          value={editForm.assignedTo || ''}
                          onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                          placeholder="Enter assignee..."
                          className="w-full bg-gray-700 rounded p-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <div className="relative">
                          <textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Additional notes..."
                            className="w-full bg-gray-700 rounded p-2 h-20 pr-12"
                          />
                          <div className="absolute right-2 top-2">
                            <SpeechToText
                              onTranscript={(text) => {
                                setEditForm({ 
                                  ...editForm, 
                                  notes: editForm.notes ? `${editForm.notes} ${text}` : text 
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={editForm.tags?.join(', ') || ''}
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                          })}
                          placeholder="Enter tags..."
                          className="w-full bg-gray-700 rounded p-2"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center gap-2"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={todo.id}
                className={`p-4 rounded-lg border ${
                  todo.completed 
                    ? 'border-green-800 bg-green-900/20' 
                    : isPast
                    ? 'border-red-800 bg-red-900/20'
                    : isNearDue
                    ? 'border-yellow-800 bg-yellow -800 bg-yellow-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-gray-400">
                        From: {todo.projectName} ({todo.noteType})
                      </p>
                      {todo.projectId !== 'manual' && (
                        <button
                          onClick={() => onNavigateToRecord(todo.projectId)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Go to record"
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {todo.priority && (
                        <span className={`flex items-center gap-1 text-sm ${getPriorityColor(todo.priority)}`}>
                          <AlertCircle size={14} />
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </span>
                      )}
                      {todo.category && (
                        <span className={`flex items-center gap-1 text-sm ${getCategoryColor(todo.category)}`}>
                          <Tag size={14} />
                          {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className={`flex items-center gap-1 text-sm ${
                          isPast 
                            ? 'text-red-400' 
                            : isNearDue 
                            ? 'text-yellow-400 animate-pulse' 
                            : 'text-gray-400'
                        }`}>
                          <Clock size={14} />
                          Due: {formatDateTime(`${todo.dueDate}T${todo.dueTime || '12:00'}`)}
                          {isNearDue && !todo.completed && (
                            <span className="ml-2 text-yellow-400">Due soon!</span>
                          )}
                          {isPast && !todo.completed && (
                            <span className="ml-2 text-red-400">Overdue!</span>
                          )}
                        </span>
                      )}
                      {todo.assignedTo && (
                        <span className="flex items-center gap-1 text-sm text-purple-400">
                          <User size={14} />
                          {todo.assignedTo}
                        </span>
                      )}
                    </div>

                    <p className="mb-2">{todo.content}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Added: {formatDateTime(todo.dateCreated)}</span>
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="flex gap-1">
                          {todo.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-700 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {todo.notes && (
                      <>
                        <button
                          onClick={() => toggleNotes(todo.id)}
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpanded ? 'Hide Notes' : 'Show Notes'}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-2 bg-gray-700 rounded">
                            <p className="whitespace-pre-wrap">{todo.notes}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditing(todo)}
                      className="p-1 rounded bg-gray-600 hover:bg-gray-500"
                      title="Edit todo"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className={`p-1 rounded ${
                        todo.completed ? 'bg-green-600' : 'bg-gray-600'
                      } hover:opacity-80`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className={`p-1 rounded ${
                        showDeleteConfirm === todo.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      title={showDeleteConfirm === todo.id ? 'Click again to confirm deletion' : 'Delete todo'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showHelp && (
        <Help
          title="To-Do Calendar Help"
          sections={[
            {
              title: "Adding Tasks",
              content: (
                <div className="space-y-4">
                  <p>There are two ways to add tasks to your to-do list:</p>
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Manual Entry</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Type your task in the input field at the top</li>
                      <li>Use the microphone icon for voice input</li>
                      <li>Set priority, category, due date, and assignee</li>
                      <li>Add notes and tags for better organization</li>
                      <li>Click the plus button or press Enter to add the task</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">From Records</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Tasks are automatically added when you check notes in records</li>
                      <li>These tasks include references to their source record</li>
                      <li>Click the link icon to jump to the source record</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Task Properties",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Available Fields</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Priority: Low, Medium, High, Urgent</li>
                      <li>Category: Work, Personal, Bug, Feature, Improvement, Documentation, Other</li>
                      <li>Due Date & Time: Set specific deadline with optional time</li>
                      <li>Assigned To: Specify task owner</li>
                      <li>Notes: Additional details or context</li>
                      <li>Tags: Categorize and group related tasks</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Deadline Alerts",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Visual Indicators</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Yellow background: Task is due within the next hour</li>
                      <li>Red background: Task is overdue</li>
                      <li>Green background: Task is completed</li>
                      <li>Time alerts update automatically every minute</li>
                    </ul>
                  </div>
                </div>
              )
            }
          ]}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
};

export default TodoCalendar;