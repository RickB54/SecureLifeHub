import type { ReactNode } from 'react';

const topics: [string, string[]][] = [
  ['Navigation & menus', [
    'Home lists your visible records; To-Do manages tasks; Ideas stores app ideas; Favorites and Hidden show those records; Settings manages your preferences and data. The selected navigation button stays cyan.',
    'Choose Platform, App Name, dates, Google Account, AI Agents, Google Keep, Cloud Services or Record Order in the first menu. Use the up/down arrows to reverse the order.',
    'The next menu lists values for the chosen sort. Check several values to show any matching record. Favorites and Hidden Records combine with other checked values, rather than narrowing them.',
    'All apps lets you check several app names to filter, or use Open to view one immediately. Yellow stars identify favorites; crossed-out eyes identify hidden apps. Select all and Clear affect that menu. The reset arrow clears all filters, search and sorting.',
    'The count shows matching records out of all saved records. Favorites and Hidden have app-name quick jumps above their records, below the header. The floating up arrow returns to the top.',
  ]],
  ['Opening & editing records', [
    'Add Record creates an editable blank record. The double-arrow header control opens the first matching record or closes the open record. Opening a record shows only that record; X closes it, saves changes and returns to your filtered list.',
    'The main header hides when a record opens. Tap the centered pull handle, or drag it downward, to reveal the controls. Tap it again to hide them. Ordinary scrolling inside the record is unchanged.',
    'Double-click or double-tap a cover field to open the record and jump to that section. Dragging to scroll does not trigger a jump. The small cover arrow compacts or reveals the record cover.',
    'The star marks a favorite. The eye hides a record; the crossed-out eye shows it again. Hidden records remain saved and editable on the Hidden page. Settings can also show them on Home.',
    'Record arrows move a record up or down and switch to Record Order. The image icon manages screenshots, the printer opens record printing, and the trash icon deletes the record. With confirmation enabled, click the trash again to confirm.',
    'Platforms, AI Agents, AI Tools and Cloud Services keep their checkboxes and offer account choices beside each item. Choose multiple accounts or add freeform custom choices. Added section choices are available in every record; deleting a shared choice removes it everywhere.',
    'Dates display as MM-DD-YYYY; the calendar icon opens a date picker. Notes track requests, completed work and needed fixes, and can become To-Do items. The italic Modified time changes only for actual record edits and is excluded from reports.',
  ]],
  ['PDF & spreadsheet exports', [
    'The document icon opens Save to PDF; the spreadsheet icon opens Save Spreadsheet. Choose App Summary for cover data or All Fields for record details and global custom fields.',
    'All Records exports the current page’s records. Filtered/Sorted Records exports the matching list in the current order, with the selected sort, values and search in its title. For example, sorting by AI Agents includes AI Agents in the export title. The title preview appears at the bottom of Save Options.',
    'PDF offers portrait or landscape Letter paper with selectable text, two columns and record dividers. Spreadsheet downloads an Excel/LibreOffice-compatible XLSX with filterable tables and separate Landscape and Portrait print sheets. On supported phones a share sheet may appear.',
    'Download becomes available after the file is ready. Exports reflect current edits. Favorites and Hidden exports use their own page’s records.',
  ]],
  ['Settings: every section', [
    'Display & Appearance: choose Dark, Light, OLED or Cyberpunk, enter or exit full screen where supported, and choose Comfortable or Compact density.',
    'Views & Navigation: set startup sorting and the default page, show hidden records, or remember and reopen your last viewed record.',
    'Export Preferences: set the initial PDF orientation and App Summary or All Fields scope. You can change either in Save Options.',
    'Editor & Auto-Save: enable auto-save and choose its delay. With auto-save off, closing a record, switching pages or leaving the page saves edits. Confirm before deleting controls record and custom-field deletion prompts.',
    'Custom Record History: add a field name, type and placement. Dropdown and checkbox types need comma-separated options. Fields appear globally in the selected location; use edit, up/down and trash to rename, move, reorder or delete them. Renames keep values attached; deletion removes that field’s values from every record.',
    'Data & Storage: download a JSON backup, restore a saved backup, clear records or inspect storage usage in KB. Restore replaces the current journal after validation. Clear leaves an empty journal even after reloading. Data is stored in this browser, so keep backups when changing devices or addresses.',
    'About & System Info shows the app version, total records, custom field count and starting-backup date. The bundled backup loads once per version; subsequent additions, edits and deletions remain yours.',
  ]],
];

export const journalHelpSections: { title: string; content: ReactNode }[] = topics.map(([title, items]) => ({ title, content: <ul className="list-disc pl-5 space-y-3">{items.map(item => <li key={item}>{item}</li>)}</ul> }));