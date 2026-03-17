import { Separator } from "@/components/ui/separator"

export function DatabaseHelp() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Database Overview</h2>
        <p>
          The Database section is the core of your application, allowing you to create, manage, and organize your
          records. Each database has a customizable structure with fields you define, and can store any number of
          records.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Creating & Managing Databases</h2>
        <h3 className="font-medium mt-4 mb-1">Creating a New Database</h3>
        <p className="mb-2">To create a new database:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Click the "Database Actions" button in the bottom menu</li>
          <li>Select "Create New Database"</li>
          <li>Enter a title for your database</li>
          <li>Define the fields you want to include (name and type)</li>
          <li>For dropdown and checkbox fields, add the options you need</li>
          <li>Click "Create Database" to save</li>
        </ol>

        <h3 className="font-medium mt-4 mb-1">Use As Template</h3>
        <p className="mb-2">
          This feature allows you to use an existing database structure as a template for creating a new database:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Click "Use As Template" in the Database Actions menu</li>
          <li>Select the database you want to use as a template</li>
          <li>The form builder will open with all fields pre-populated</li>
          <li>Modify the fields as needed</li>
          <li>Give your new database a unique name</li>
          <li>Click "Create Database" to save</li>
        </ul>
        <p className="mt-2">
          <strong>Note:</strong> Using a database as a template copies only the structure (fields), not the records.
        </p>

        <h3 className="font-medium mt-4 mb-1">Edit Display Fields</h3>
        <p className="mb-2">This feature lets you choose which fields appear on record cards in the main view:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Select up to 9 fields to display on each record card</li>
          <li>Fields will be arranged in a 3×3 grid below the record title</li>
          <li>Each field displays up to 25 characters to prevent UI clutter</li>
          <li>Changes apply to all records in the database</li>
          <li>This helps you quickly see important information without expanding records</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Todo List Settings</h3>
        <p className="mb-2">Control how database fields integrate with the Todo list:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Enable or disable Todo integration for the current database</li>
          <li>Select which text and textarea fields can be synced with Todos</li>
          <li>When enabled, these fields can be sent to the Todo list</li>
          <li>Updates to the field will automatically update the linked Todo</li>
          <li>This creates a two-way connection between your database records and Todo items</li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Working with Records</h2>

        <h3 className="font-medium mt-4 mb-1">Adding Records</h3>
        <p className="mb-2">To add a new record to your database:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Click the "Add Record" button at the top of the screen</li>
          <li>Fill in the fields in the form that appears</li>
          <li>Click "Create Record" to save</li>
        </ol>

        <h3 className="font-medium mt-4 mb-1">Record Actions</h3>
        <p className="mb-2">Each record has several actions available:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Edit</strong> - Modify the record's field values
          </li>
          <li>
            <strong>Duplicate</strong> - Create a copy of the record
          </li>
          <li>
            <strong>Gallery</strong> - View and manage images attached to the record
          </li>
          <li>
            <strong>Send to Todo</strong> - Send a text field to the Todo list
          </li>
          <li>
            <strong>Favorite</strong> - Mark a record as a favorite for quick access
          </li>
          <li>
            <strong>Expand/Collapse</strong> - Show or hide the record's full details
          </li>
          <li>
            <strong>Export to CSV</strong> - Download the record as a CSV file
          </li>
          <li>
            <strong>Print</strong> - Print the record
          </li>
          <li>
            <strong>Delete</strong> - Remove the record from the database
          </li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Viewing Full Notes</h3>
        <p className="mb-2">For text and textarea fields with long content:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Click the "..." menu on the field</li>
          <li>Select "View Full Note" to see the complete content</li>
          <li>A dialog will open with scrollable content</li>
          <li>This is especially useful for long notes that don't fit in the record view</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Field Actions</h3>
        <p className="mb-2">Text and textarea fields have additional actions available:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Edit</strong> - Open a dedicated editor for the field
          </li>
          <li>
            <strong>Send to Todo List</strong> - Create a Todo item from the field content
          </li>
          <li>
            <strong>View Full Note</strong> - See the complete content in a dialog
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Sorting & Filtering</h2>
        <p className="mb-2">You can organize your records in several ways:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Sort</strong> - Click the Sort button to order records by:
            <ul className="list-disc pl-6 mt-1">
              <li>Last Updated (newest or oldest first)</li>
              <li>Created Date (newest or oldest first)</li>
              <li>Title (A-Z or Z-A)</li>
              <li>Priority (high to low)</li>
              <li>Due Date (soonest first)</li>
            </ul>
          </li>
          <li>
            <strong>Search</strong> - Use the search box to filter records by any text they contain
          </li>
          <li>
            <strong>Collapse All</strong> - Quickly collapse all expanded records
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Backup & Export</h2>
        <p className="mb-2">Protect and share your data with these options:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Backup Database</strong> - Save the current database to a JSON file
          </li>
          <li>
            <strong>Backup All Databases</strong> - Save all databases to a single JSON file
          </li>
          <li>
            <strong>Export to CSV</strong> - Export the database or individual records to CSV format
          </li>
          <li>
            <strong>Print Database</strong> - Generate a printable version of your database
          </li>
          <li>
            <strong>Restore Database</strong> - Import a previously backed up database
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Security</h2>
        <p className="mb-2">Protect your data with PIN security:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Change PIN</strong> - Update your security PIN
          </li>
          <li>
            <strong>PIN Protection</strong> - Certain actions require PIN verification:
            <ul className="list-disc pl-6 mt-1">
              <li>Creating a new database</li>
              <li>Backing up databases</li>
              <li>Restoring databases</li>
              <li>Clearing all data</li>
            </ul>
          </li>
        </ul>
        <p className="mt-2">
          <strong>Note:</strong> The default PIN is "1234" if you haven't changed it.
        </p>
      </section>
    </div>
  )
}

