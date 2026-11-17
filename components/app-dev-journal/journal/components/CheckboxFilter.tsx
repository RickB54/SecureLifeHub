import { ChevronDown, Star, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Option { value: string; label: string; favorite?: boolean; hidden?: boolean }
export default function CheckboxFilter({ label, allLabel, options, selected, onChange, onOpenItem }: {
  label: string; allLabel: string; options: Option[]; selected: string[]; onChange: (next: string[]) => void; onOpenItem?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (value: string) => onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  const summary = selected.length === 0 ? allLabel : selected.length === 1 ? options.find(o => o.value === selected[0])?.label ?? '1 selected' : `${selected.length} selected`;
  return (
    <div className="flex flex-col gap-1 text-sm flex-1 min-w-0">
      <span>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" aria-label={label} data-selected={selected.length > 0} className="journal-menu-trigger w-full justify-between font-normal"><span className="min-w-0 whitespace-normal text-left leading-tight">{summary}</span><ChevronDown size={14} className="shrink-0" /></Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="journal-app-menu p-2">
          <div className="flex justify-between pb-2 border-b border-border mb-2">
            <Button size="sm" variant="ghost" onClick={() => onChange(options.map(o => o.value))}>Select all</Button>
            <Button size="sm" variant="ghost" onClick={() => onChange([])}>Clear</Button>
          </div>
          <ul className="max-h-72 overflow-y-auto space-y-1">
            {options.map(option => (
              <li key={option.value} data-selected={selected.includes(option.value)} className="journal-menu-option flex items-start gap-2 rounded px-1 py-2">
                <Checkbox id={`f-${label}-${option.value}`} checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                <label htmlFor={`f-${label}-${option.value}`} className="min-w-0 flex-1 cursor-pointer text-xs leading-5 whitespace-normal break-words">{option.favorite && <Star size={14} aria-label="Favorite" className="inline mr-1 text-journal-keep fill-current" />}{option.hidden && <EyeOff size={14} aria-label="Hidden" className="inline mr-1 text-journal-label" />}{option.label}</label>
                {onOpenItem && <Button size="sm" variant="ghost" className="h-6 px-2 text-xs shrink-0" onClick={() => { setOpen(false); onOpenItem(option.value); }}>Open</Button>}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
