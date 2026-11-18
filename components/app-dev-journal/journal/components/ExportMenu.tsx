import { useEffect, useMemo, useState } from 'react';
import { Download, FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { createCoverSpreadsheet, deliverCoverSpreadsheet, spreadsheetProjects } from '../coverSpreadsheet';
import { createCoverPdf, deliverCoverPdf } from '../coverPdf';
import { reportTitle, type ReportScope } from '../reportData';
import type { Project } from '../types';
import { recordSortLabels, type RecordSort, type SortDirection } from '../recordView';

export default function ExportMenu({ kind, projects, filtered, sort, direction, filter, search, defaultScope = 'summary', defaultOrientation = 'portrait' }: { defaultScope?: ReportScope; defaultOrientation?: 'portrait' | 'landscape'; kind: 'pdf' | 'xlsx'; projects: Project[]; filtered: Project[]; sort: RecordSort; direction: SortDirection; filter: string; search: string }) {
  const [scope, setScope] = useState<ReportScope>(defaultScope);
  const [selection, setSelection] = useState('all');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const active = sort !== 'platform' || direction !== 'asc' || Boolean(filter || search);
  const records = selection === 'filtered' ? filtered : projects;
  const options = useMemo(() => ({ scope, orientation, customFields: JSON.parse(localStorage.getItem('customFields') || '[]'), title: reportTitle(`${recordSortLabels[sort]} (${direction === 'asc' ? 'ascending' : 'descending'})`, selection === 'filtered' ? [filter, search].filter(Boolean).join('; ') : '') }), [scope, orientation, selection, sort, direction, filter, search]);
  useEffect(() => {
    let cancelled = false; setBlob(null); setError('');
    const prepare = kind === 'pdf' ? Promise.resolve(createCoverPdf(spreadsheetProjects(records, sort, direction), options)) : createCoverSpreadsheet(records, sort, direction, options);
    prepare.then(value => { if (!cancelled) setBlob(value); }).catch(() => { if (!cancelled) setError('Could not prepare download.'); });
    return () => { cancelled = true; };
  }, [records, options, kind, selection, sort, direction]);
  const label = kind === 'pdf' ? 'Save to PDF' : 'Save Spreadsheet';
  return <TooltipProvider><DropdownMenu><Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><Button variant="secondary" size="icon" aria-label={label} title={label} className="journal-menu-trigger">{kind === 'pdf' ? <FileDown size={18} /> : <FileSpreadsheet size={18} />}</Button></DropdownMenuTrigger></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel>Scope</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={scope} onValueChange={value => setScope(value as ReportScope)}>
        <DropdownMenuRadioItem value="summary" onSelect={event => event.preventDefault()}>App Summary</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="all" onSelect={event => event.preventDefault()}>All Fields</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup><DropdownMenuSeparator />
      <DropdownMenuLabel>Records</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={selection} onValueChange={setSelection}>
        <DropdownMenuRadioItem value="all" onSelect={event => event.preventDefault()}>All Records ({projects.length})</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="filtered" disabled={!active} onSelect={event => event.preventDefault()}>Filtered/Sorted Records ({filtered.length})</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      {kind === 'pdf' && <><DropdownMenuSeparator /><DropdownMenuLabel>Paper orientation</DropdownMenuLabel><DropdownMenuRadioGroup value={orientation} onValueChange={value => setOrientation(value as 'portrait' | 'landscape')}><DropdownMenuRadioItem value="portrait" onSelect={event => event.preventDefault()}>Portrait</DropdownMenuRadioItem><DropdownMenuRadioItem value="landscape" onSelect={event => event.preventDefault()}>Landscape</DropdownMenuRadioItem></DropdownMenuRadioGroup></>}
      <DropdownMenuSeparator /><DropdownMenuItem disabled={!blob || records.length === 0} onSelect={() => { if (blob) void (kind === 'pdf' ? deliverCoverPdf(blob) : deliverCoverSpreadsheet(blob)); }}><Download />Download {kind === 'pdf' ? 'PDF' : 'Spreadsheet'}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a
          href="/AG-Account-Tracker.pdf"
          download="AG-Account-Tracker.pdf"
          title="AG Account Tracker"
          aria-label="AG Account Tracker"
          className="flex items-center gap-2 cursor-pointer w-full"
        >
          <FileText className="h-4 w-4" />
          <span>AG Account Tracker</span>
        </a>
      </DropdownMenuItem>
      <p className="px-2 py-1 text-xs text-muted-foreground break-words" aria-label="Export title">{options.title}</p>
      {error && <p role="alert" className="p-2 text-sm text-destructive">{error}</p>}
    </DropdownMenuContent></DropdownMenu></TooltipProvider>;
}