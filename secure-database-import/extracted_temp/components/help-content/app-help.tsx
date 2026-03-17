import { Separator } from "@/components/ui/separator"

export function AppHelp() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Application Overview</h2>
        <p>
          This custom database tool allows you to create and manage multiple databases with flexible structures. You can
          store records, attach images, generate reports, and manage todos - all in one application.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Main Components</h2>
        <p className="mb-2">The application consists of several key components:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Database Sidebar</strong> - Lists all your databases and allows switching between them
          </li>
          <li>
            <strong>Database View</strong> - Shows records in the current database with options to add, edit, and manage
            them
          </li>
          <li>
            <strong>Bottom Menu</strong> - Provides access to favorites, database actions, todo list, reports, and
            collapse functions
          </li>
          <li>
            <strong>Reports</strong> - Allows you to analyze and visualize your database data
          </li>
          <li>
            <strong>Todo List</strong> - Helps you track tasks and manage your workflow
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Navigation</h2>
        <h3 className="font-medium mt-4 mb-1">Top Navigation</h3>
        <p className="mb-2">The top navigation bar includes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Menu Button</strong> - Opens the database sidebar on mobile devices
          </li>
          <li>
            <strong>Add Record Button</strong> - Creates a new record in the current database
          </li>
          <li>
            <strong>Theme Toggle</strong> - Switches between light and dark mode
          </li>
          <li>
            <strong>Search Box</strong> - Filters records in the current database
          </li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Bottom Menu</h3>
        <p className="mb-2">The bottom menu provides access to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Home</strong> - Returns to the main database view
          </li>
          <li>
            <strong>Favorites</strong> - Shows records marked as favorites
          </li>
          <li>
            <strong>Actions</strong> - Provides database management options
          </li>
          <li>
            <strong>Todo</strong> - Opens the todo list
          </li>
          <li>
            <strong>Reports</strong> - Opens the reports section
          </li>
          <li>
            <strong>Collapse</strong> - Collapses all expanded records
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Databases</h2>
        <p className="mb-2">Databases are the core of the application:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Each database has a custom structure with fields you define</li>
          <li>Fields can be of various types: text, number, date, dropdown, checkbox, textarea, or gallery</li>
          <li>You can create multiple databases for different purposes</li>
          <li>Switch between databases using the sidebar</li>
          <li>Each database is color-coded for easy identification</li>
        </ul>
        <p className="mt-2">
          See the Database Help section for detailed information on creating and managing databases.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Records</h2>
        <p className="mb-2">Records store your data within databases:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Each record contains values for the fields defined in the database</li>
          <li>Records can be expanded to show all field values</li>
          <li>You can edit, duplicate, or delete records</li>
          <li>Records can have images attached via gallery fields</li>
          <li>Mark important records as favorites for quick access</li>
          <li>Export individual records to CSV or print them</li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Todo Integration</h2>
        <p className="mb-2">The Todo list integrates with your databases:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Enable Todo integration in database settings</li>
          <li>Send text fields from records to the Todo list</li>
          <li>Changes to linked fields automatically update in the Todo list</li>
          <li>Organize todos with priorities, due dates, and categories</li>
          <li>Filter and sort todos to focus on what's important</li>
        </ul>
        <p className="mt-2">See the Todo Help section for detailed information on managing tasks.</p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Reports</h2>
        <p className="mb-2">Generate insights from your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use predefined reports for quick analysis</li>
          <li>Create custom reports with specific fields and filters</li>
          <li>Group and aggregate data for summary reports</li>
          <li>View results in table or chart format</li>
          <li>Export reports to CSV or print them</li>
          <li>Save reports for future use</li>
        </ul>
        <p className="mt-2">See the Reports Help section for detailed information on creating and using reports.</p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Data Management</h2>
        <p className="mb-2">Protect and manage your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Back up individual databases or all databases</li>
          <li>Restore databases from backups</li>
          <li>Export data to CSV format</li>
          <li>Secure sensitive operations with PIN protection</li>
          <li>Recover original database templates if needed</li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Tips & Shortcuts</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the search box to quickly find records</li>
          <li>Mark frequently accessed records as favorites</li>
          <li>Use the collapse button to quickly collapse all expanded records</li>
          <li>Set up display fields to show important information at a glance</li>
          <li>Use the database color coding to quickly identify different databases</li>
          <li>Back up your data regularly to prevent loss</li>
        </ul>
      </section>
    </div>
  )
}

