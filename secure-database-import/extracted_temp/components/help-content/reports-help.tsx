import { Separator } from "@/components/ui/separator"

export function ReportsHelp() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Reports Overview</h2>
        <p>
          The Reports section allows you to analyze and visualize your database records in various ways. You can create
          custom reports, save them for future use, and export the results.
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Predefined Reports</h2>
        <p className="mb-2">
          Predefined reports provide quick insights into your database without requiring any setup:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Database Summary</strong> - Shows an overview of your database including total records, fields, and
            date information.
          </li>
          <li>
            <strong>Records by Category</strong> - Groups records by category fields (dropdown or checkbox) and displays
            counts.
          </li>
          <li>
            <strong>Recently Added Records</strong> - Shows records added in the last 30 days, sorted by creation date.
          </li>
        </ul>
        <p className="mt-2">To run a predefined report, simply click on the report card or the "Run" button.</p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Report Builder</h2>
        <p className="mb-2">
          The custom report builder allows you to create tailored reports with specific fields, filters, and sorting
          options:
        </p>

        <h3 className="font-medium mt-4 mb-1">Select Fields</h3>
        <p className="mb-2">Choose which fields to include in your report results. You can:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Select individual fields by checking their checkboxes</li>
          <li>Use "Select All Fields" to include all database fields</li>
          <li>Remove fields by clicking the X on their badge</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Filters</h3>
        <p className="mb-2">Add conditions to narrow down your report data:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Click "Add Filter" to create a new filter condition</li>
          <li>Select a field to filter on</li>
          <li>Choose an operator (equals, contains, greater than, etc.)</li>
          <li>Enter a value to compare against</li>
          <li>Add multiple filters to create complex conditions</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Sort Options</h3>
        <p className="mb-2">Define how your report data should be ordered:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Click "Add Sort" to create a new sort rule</li>
          <li>Select a field to sort by</li>
          <li>Choose ascending or descending order</li>
          <li>Add multiple sort options for nested sorting</li>
        </ul>

        <h3 className="font-medium mt-4 mb-1">Advanced Options</h3>
        <p className="mb-2">Group and aggregate your data for summary reports:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Group By</strong> - Select a field to group results by (e.g., category, status)
          </li>
          <li>
            <strong>Aggregation</strong> - When grouping, you can apply functions to numeric fields:
            <ul className="list-disc pl-6 mt-1">
              <li>Sum - Calculate the total of a numeric field</li>
              <li>Average - Calculate the average value</li>
              <li>Count - Count the number of records in each group</li>
              <li>Minimum - Find the smallest value</li>
              <li>Maximum - Find the largest value</li>
            </ul>
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Report Results</h2>
        <p className="mb-2">After running a report, you can:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>View Results</strong> - See your data in table format
          </li>
          <li>
            <strong>Switch to Chart View</strong> - For grouped reports, visualize data as a bar chart
          </li>
          <li>
            <strong>Export to CSV</strong> - Download the report data as a CSV file for use in spreadsheet applications
          </li>
          <li>
            <strong>Print Report</strong> - Generate a printable version of your report
          </li>
        </ul>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Saved Reports</h2>
        <p className="mb-2">Save your custom reports for future use:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Save Report</strong> - After creating a custom report, click "Save Report" to store it
          </li>
          <li>
            <strong>Load</strong> - Load a saved report's settings into the report builder
          </li>
          <li>
            <strong>Run</strong> - Execute a saved report directly
          </li>
          <li>
            <strong>Delete</strong> - Remove a saved report you no longer need
          </li>
        </ul>
        <p className="mt-2">Saved reports are stored locally and will persist between sessions.</p>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">Tips for Effective Reports</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Start with a clear question you want to answer with your report</li>
          <li>Select only the fields that are relevant to your analysis</li>
          <li>Use filters to focus on specific subsets of your data</li>
          <li>For numerical analysis, use grouping with aggregation functions</li>
          <li>Save frequently used reports to save time in the future</li>
          <li>Use the chart view for a quick visual understanding of grouped data</li>
        </ul>
      </section>
    </div>
  )
}

