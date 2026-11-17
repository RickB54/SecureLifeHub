import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate, toIsoDate } from '../dates';

export default function DateField({ value = '', onChange, className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [draft, setDraft] = useState(formatDate(String(value)));
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const iso = toIsoDate(String(value));
  const selected = iso ? new Date(`${iso}T00:00:00`) : undefined;
  useEffect(() => setDraft(formatDate(String(value))), [value]);
  const commit = (text: string, target: HTMLInputElement) => {
    const iso = toIsoDate(text);
    target.setCustomValidity(text && !iso ? 'Enter a valid date as MM-DD-YYYY.' : '');
    if (!text || iso) onChange?.({ target: { ...target, value: iso }, currentTarget: target } as React.ChangeEvent<HTMLInputElement>);
  };
  return <div className="relative min-w-0 flex-1">
    <input {...props} ref={input} type="text" inputMode="numeric" placeholder="MM-DD-YYYY" value={draft}
      className={`${className || ''} w-full pr-10`} onChange={e => { setDraft(e.target.value); commit(e.target.value, e.target); }}
      onBlur={e => { if (draft && !toIsoDate(draft)) e.target.reportValidity(); else setDraft(formatDate(draft)); }} />
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 text-journal-label" aria-label={`Choose ${props['aria-label'] || 'date'}`} title="Choose date"><CalendarIcon /></Button></PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto z-[10050]" align="end">
        <Calendar mode="single" selected={selected} {...(selected ? { defaultMonth: selected } : {})} captionLayout="dropdown" onSelect={date => {
          if (!date || !input.current) return;
          const text = formatDate(date);
          setDraft(text); commit(text, input.current); setOpen(false);
        }} className="pointer-events-auto" />
      </PopoverContent>
    </Popover>
  </div>;
}