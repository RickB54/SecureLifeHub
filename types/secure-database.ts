export type FieldType = "text" | "number" | "date" | "checkbox" | "dropdown" | "textarea" | "gallery"

export interface Field {
  name: string
  type: FieldType
  options?: string[]
  showOnCard?: boolean
}

export interface DbRecord {
  id: string
  values: { [key: string]: any }
  isFavorite: boolean
  images?: string[]
  created: string
  lastUpdated: string
}

export interface DisplayFieldSettings {
  fields: string[] // Array of field names to display (max 9)
}

export interface Database {
  title: string
  fields: Field[]
  records: DbRecord[]
  color?: string // Optional color name
  displaySettings?: DisplayFieldSettings
  todoSettings?: TodoSettings
}

export interface TodoSettings {
  enabled: boolean
  noteFields: string[] // Array of field names to sync with todos
}

export type TodoPriority = "low" | "medium" | "high" | "urgent"
export type TodoStatus = "active" | "in-progress" | "completed" | "archived"

export interface TodoItem {
  id: string
  title: string
  notes: string
  priority: TodoPriority
  status: TodoStatus
  dueDate?: string // ISO timestamp
  created: string // ISO timestamp
  lastUpdated: string // ISO timestamp
  sourceDatabase?: string
  sourceRecordId?: string
  sourceFieldName?: string
  category?: string
  tags: string[]
  subtasks?: TodoSubtask[]
}

export interface TodoSubtask {
  id: string
  title: string
  completed: boolean
}

export interface TodoFilter {
  status?: TodoStatus[]
  priority?: TodoPriority[]
  sourceDatabase?: string[]
  category?: string[]
  tags?: string[]
  dateRange?: {
    start?: string
    end?: string
  }
  searchQuery?: string
}

export interface TodoSort {
  field: "dueDate" | "priority" | "created" | "lastUpdated" | "title" | "category" | "sourceDatabase"
  direction: "asc" | "desc"
}
