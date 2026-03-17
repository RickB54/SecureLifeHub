import { Separator } from "@/components/ui/separator"

export function TodoHelp() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Todo List Overview</h2>
        <p>
          The Todo list helps you track tasks and manage your workflow. It integrates with your databases, allowing you
          to create tasks from database records and keep them in sync.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Creating & Managing Todos</h2>

        <h3 className="font-medium mt-4 mb-1">Adding a New Todo</h3>
        <p className="mb-2">To create a new todo item:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Click the "Add Todo" button</li>
          <li>Enter a title for your task</li>
          <li>Add optional details like notes, priority, due date, etc.</li>
          <li>Add subtasks if needed (one per line)</li>
          <li>Click "Add Todo" to save</li>
        </ol>

        <h3 className="font-medium mt-4 mb-1">Todo Status</h3>
        <p className="mb-2">Todos can have different statuses:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Active</strong> - Tasks that need to be done
          </li>
          <li>
            <strong>In Progress</strong> - Tasks you're currently working on
          </li>
          <li>
            <strong>Completed</strong> - Tasks that have been finished
          </li>
          <li>
            <strong>Archived</strong> - Tasks that are no longer relevant but kept for reference
          </li>
        </ul>
        <p className="mt-2">You can change a todo's status by:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Clicking the status icon to toggle between active and completed</li>
          <li>Using the dropdown menu for more status options</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Priority Levels</h3>
        <p className="mb-2">Assign priorities to organize your tasks:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Low</strong> - Tasks that aren't time-sensitive
          </li>
          <li>
            <strong>Medium</strong> - Standard priority tasks
          </li>
          <li>
            <strong>High</strong> - Important tasks that need attention soon
          </li>
          <li>
            <strong>Urgent</strong> - Critical tasks requiring immediate attention
          </li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Subtasks</h3>
        <p className="mb-2">Break down complex todos into smaller steps:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Add subtasks when creating or editing a todo</li>
          <li>Check off subtasks as you complete them</li>
          <li>Track progress with the subtask counter (e.g., "2/5 completed")</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Unarchiving Todos</h3>
        <p className="mb-2">To unarchive a todo that was previously archived:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the "Archived" tab</li>
          <li>Find the todo you want to unarchive</li>
          <li>Click the dropdown menu (three dots)</li>
          <li>Select "Mark as Active" to unarchive the todo</li>
        </ol>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Database Integration</h2>
        <p className="mb-2">A powerful feature of the Todo list is its integration with database records:</p>

        <h3 className="font-medium mt-4 mb-1">Sending Notes to Todo List</h3>
        <p className="mb-2">You can create todos from text fields in your database records:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Enable Todo integration in the database settings</li>
          <li>Open a record and expand it to see all fields</li>
          <li>For text or textarea fields, click the "..." menu</li>
          <li>Select "Send to Todo List"</li>
          <li>Customize the todo title if needed</li>
          <li>Click "Add to Todo List" to create the todo</li>
        </ol>

        <h3 className="font-medium mt-4 mb-1">Automatic Syncing</h3>
        <p className="mb-2">When a note is linked to a todo, they stay in sync:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Updating the note in the database will update the linked todo</li>
          <li>The todo will show which database and record it came from</li>
          <li>This creates a two-way connection between your records and todos</li>
        </ul>
        <p className="mt-2">
          <strong>Note:</strong> This integration must be enabled in the database's Todo List Settings.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Filtering & Sorting</h2>

        <h3 className="font-medium mt-4 mb-1">Filtering Options</h3>
        <p className="mb-2">Narrow down your todo list with these filters:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Status</strong> - Filter by active, in-progress, completed, or archived
          </li>
          <li>
            <strong>Priority</strong> - Filter by priority level
          </li>
          <li>
            <strong>Database Source</strong> - Show todos from specific databases
          </li>
          <li>
            <strong>Categories</strong> - Filter by custom categories
          </li>
          <li>
            <strong>Tags</strong> - Filter by tags
          </li>
          <li>
            <strong>Date Range</strong> - Filter by due date range
          </li>
          <li>
            <strong>Search</strong> - Filter by text in title, notes, or tags
          </li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Sorting Options</h3>
        <p className="mb-2">Organize your todos with these sort options:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Due Date</strong> - Sort by when tasks are due
          </li>
          <li>
            <strong>Priority</strong> - Sort by importance level
          </li>
          <li>
            <strong>Created Date</strong> - Sort by when todos were created
          </li>
          <li>
            <strong>Last Updated</strong> - Sort by when todos were last modified
          </li>
          <li>
            <strong>Title</strong> - Sort alphabetically by title
          </li>
          <li>
            <strong>Category</strong> - Sort by category
          </li>
          <li>
            <strong>Database Source</strong> - Sort by originating database
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Working with Long Notes</h2>
        <p className="mb-2">When a todo has a long note, you can view it more easily:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Preview</strong> - The todo card shows a preview of the note (first few lines)
          </li>
          <li>
            <strong>View Full Note</strong> - Click the "View Full Note" button to see the entire note
          </li>
          <li>
            <strong>Scrollable Dialog</strong> - The full note opens in a dialog with its own scrollbar
          </li>
        </ul>
        <p className="mt-2">This makes it easy to work with detailed notes without cluttering the todo list view.</p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Tips for Effective Todo Management</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use priorities to focus on what's most important</li>
          <li>Break down complex tasks into subtasks</li>
          <li>Set due dates for time-sensitive tasks</li>
          <li>Use categories and tags to organize related todos</li>
          <li>Archive completed todos instead of deleting them to keep a record</li>
          <li>Use the database integration for todos that relate to specific records</li>
          <li>Check the "Active" tab daily to see what needs attention</li>
        </ul>
      </section>
    </div>
  )
}

