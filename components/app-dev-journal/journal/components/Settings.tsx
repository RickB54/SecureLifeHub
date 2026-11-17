// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Edit2, Maximize, Minimize, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import CodeDatabase from './CodeDatabase';
import { recordSortLabels } from '../recordView';
import { placementLabels, removeFieldFromRecords, renameFieldInRecords, type CustomFieldDef, type JournalSettings } from '../settings';
import { sanitizeSpelling } from '../backupData';

const APP_VERSION = '2.4.0';
const fieldTypes = { text: 'Text', number: 'Number', date: 'Date', boolean: 'Yes/No', notes: 'Notes', dropdown: 'Dropdown', checkboxes: 'Checkboxes' };
const reserved = ['id', 'appname', 'platforms', 'aiagents', 'aitools', 'cloudservices', 'usernames', 'googlekeepaccounts', 'localhost', 'order', 'previewurl', 'publishedurl', 'screenshots'];

function Section({ title, accent, children }) {
  return (
    <section className="rounded-lg bg-gray-900 overflow-hidden">
      <div className={`h-1.5 ${accent}`} />
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </section>
  );
}
function Row({ label, hint, children }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">{label}</p>{hint && <p className="text-xs text-gray-400">{hint}</p>}</div>{children}</div>;
}
const selectClass = 'rounded border border-input bg-secondary text-secondary-foreground p-2 text-sm';

export default function Settings({ settings, onChange, projects, setProjects }) {
  const set = (key, value) => onChange({ ...settings, [key]: value });
  const [fields, setFieldsState] = useState<CustomFieldDef[]>(() => JSON.parse(localStorage.getItem('customFields') || '[]'));
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ name: '', type: 'text', options: '', placement: 'customSection' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [usage, setUsage] = useState({ total: 0, rows: [] });

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs); onFs();
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  useEffect(() => {
    const rows = Object.keys(localStorage).map(key => ({ key, kb: ((localStorage.getItem(key) || '').length * 2) / 1024 })).sort((a, b) => b.kb - a.kb);
    setUsage({ total: rows.reduce((sum, row) => sum + row.kb, 0), rows: rows.slice(0, 6) });
  }, [projects, fields]);

  const saveFields = next => { setFieldsState(next); localStorage.setItem('customFields', JSON.stringify(next)); window.dispatchEvent(new Event('journal-custom-fields')); };
  const validate = (name, ignoreId) => {
    if (!name) return 'Field name cannot be empty';
    if (reserved.includes(name.toLowerCase())) return 'This name is reserved by the system';
    if (fields.some(f => f.id !== ignoreId && f.name.toLowerCase() === name.toLowerCase())) return 'A field with this name already exists';
    if ((draft.type === 'dropdown' || draft.type === 'checkboxes') && !draft.options.trim()) return 'Options are required for this field type';
    return '';
  };
  const parsedOptions = () => (draft.type === 'dropdown' || draft.type === 'checkboxes') ? draft.options.split(',').map(o => sanitizeSpelling(o.trim())).filter(Boolean) : undefined;
  const addField = () => {
    const name = sanitizeSpelling(draft.name.trim()); const problem = validate(name);
    if (problem) return setError(problem);
    saveFields([...fields, { id: Date.now().toString(), name, type: draft.type, options: parsedOptions(), placement: draft.placement }]);
    setAdding(false); setError(''); setDraft({ name: '', type: 'text', options: '', placement: 'customSection' });
  };
  const saveEdit = field => {
    const name = sanitizeSpelling(draft.name.trim()); const problem = validate(name, field.id);
    if (problem) return setError(problem);
    saveFields(fields.map(f => f.id === field.id ? { ...f, name, placement: draft.placement, options: parsedOptions() ?? f.options } : f));
    if (name !== field.name) setProjects(previous => renameFieldInRecords(previous, field.name, name));
    setEditing(null); setError('');
  };
  const removeField = field => {
    if (settings.confirmDelete && !window.confirm(`Delete the "${field.name}" field and its values from every record?`)) return;
    saveFields(fields.filter(f => f.id !== field.id));
    setProjects(previous => removeFieldFromRecords(previous, field.name));
  };
  const move = (index, delta) => {
    const next = [...fields]; const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; saveFields(next);
  };
  const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

  const fieldForm = (onSave, onCancel, isNew) => (
    <div className="grid gap-3 rounded bg-gray-800 p-3 md:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">Field name<input aria-label="Field name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="rounded bg-gray-700 p-2" /></label>
      <label className="flex flex-col gap-1 text-sm">Placement in records<select aria-label="Field placement" value={draft.placement} onChange={e => setDraft({ ...draft, placement: e.target.value })} className={selectClass}>{Object.entries(placementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {isNew && <label className="flex flex-col gap-1 text-sm">Field type<select aria-label="Field type" value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })} className={selectClass}>{Object.entries(fieldTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      {(draft.type === 'dropdown' || draft.type === 'checkboxes') && <label className="flex flex-col gap-1 text-sm">Options (comma-separated)<input value={draft.options} onChange={e => setDraft({ ...draft, options: e.target.value })} className="rounded bg-gray-700 p-2" /></label>}
      {error && <p role="alert" className="text-sm text-destructive md:col-span-2">{error}</p>}
      <div className="flex gap-2 md:col-span-2 justify-end"><Button size="sm" onClick={onSave}><Save size={16} /> Save</Button><Button size="sm" variant="secondary" onClick={onCancel}><X size={16} /> Cancel</Button></div>
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Section title="Display & Appearance" accent="bg-journal-cloud">
        <Row label="Theme preset">
          <div className="flex flex-wrap gap-2">{['dark', 'light', 'oled', 'cyberpunk'].map(theme => <Button key={theme} size="sm" variant={settings.theme === theme ? 'default' : 'secondary'} onClick={() => set('theme', theme)} className="capitalize">{theme === 'oled' ? 'OLED' : theme}</Button>)}</div>
        </Row>
        <Row label="Full screen"><Button size="sm" variant="secondary" onClick={toggleFullscreen}>{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}{isFullscreen ? 'Exit full screen' : 'Enter full screen'}</Button></Row>
        <Row label="Density"><select aria-label="Density" value={settings.density} onChange={e => set('density', e.target.value)} className={selectClass}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></Row>
      </Section>

      <Section title="Views & Navigation" accent="bg-journal-keep">
        <Row label="Default startup sort"><select aria-label="Default startup sort" value={settings.defaultSort} onChange={e => set('defaultSort', e.target.value)} className={selectClass}>{Object.entries(recordSortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Row>
        <Row label="Default tab"><select aria-label="Default tab" value={settings.defaultTab} onChange={e => set('defaultTab', e.target.value)} className={selectClass}><option value="projects">Home</option><option value="todo">To-Do</option><option value="ideas">Ideas</option><option value="favorites">Favorites</option><option value="hidden">Hidden</option><option value="settings">Settings</option></select></Row>
        <Row label="Show Hidden Records"><Switch aria-label="Show Hidden Records" checked={settings.showHiddenRecords} onCheckedChange={v => set('showHiddenRecords', v)} /></Row>
        <Row label="Remember last viewed record" hint="Reopens the record you last had open"><Switch aria-label="Remember last viewed record" checked={settings.rememberLastRecord} onCheckedChange={v => set('rememberLastRecord', v)} /></Row>
      </Section>

      <Section title="Export Preferences" accent="bg-journal-label">
        <Row label="Default PDF orientation"><select aria-label="Default PDF orientation" value={settings.pdfOrientation} onChange={e => set('pdfOrientation', e.target.value)} className={selectClass}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></Row>
        <Row label="Default export scope"><select aria-label="Default export scope" value={settings.exportScope} onChange={e => set('exportScope', e.target.value)} className={selectClass}><option value="summary">App Summary</option><option value="all">All Fields</option></select></Row>
      </Section>

      <Section title="Editor & Auto-Save" accent="bg-journal-label">
        <Row label="Auto-save" hint="When off, changes save when you close a record"><Switch aria-label="Auto-save" checked={settings.autoSave} onCheckedChange={v => set('autoSave', v)} /></Row>
        <Row label="Auto-save delay"><select aria-label="Auto-save delay" disabled={!settings.autoSave} value={settings.autoSaveDelay} onChange={e => set('autoSaveDelay', Number(e.target.value))} className={selectClass}><option value={0}>Instant</option><option value={500}>0.5 seconds</option><option value={2000}>2 seconds</option><option value={5000}>5 seconds</option></select></Row>
        <Row label="Confirm before deleting"><Switch aria-label="Confirm before deleting" checked={settings.confirmDelete} onCheckedChange={v => set('confirmDelete', v)} /></Row>
      </Section>

      <Section title="Custom Record History" accent="bg-destructive">
        <p className="text-sm text-gray-400">Custom fields appear in every record at the place you choose.</p>
        {fields.length === 0 && <p className="text-sm text-gray-400">No custom fields yet.</p>}
        <ul className="space-y-2">
          {fields.map((field, index) => (
            <li key={field.id} className="space-y-2">
              {editing === field.id ? fieldForm(() => saveEdit(field), () => { setEditing(null); setError(''); }, false) : (
                <div className="flex flex-wrap items-center gap-2 rounded bg-gray-800 p-2">
                  <span className="font-medium">{field.name}</span>
                  <span className="text-xs text-gray-400">{fieldTypes[field.type] || field.type} · {placementLabels[field.placement || 'customSection']}</span>
                  <div className="ml-auto flex gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Move ${field.name} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Move ${field.name} down`} disabled={index === fields.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Edit ${field.name}`} onClick={() => { setEditing(field.id); setAdding(false); setError(''); setDraft({ name: field.name, type: field.type, options: (field.options || []).join(', '), placement: field.placement || 'customSection' }); }}><Edit2 size={16} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${field.name}`} onClick={() => removeField(field)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {adding ? fieldForm(addField, () => { setAdding(false); setError(''); }, true) : <Button size="sm" onClick={() => { setAdding(true); setEditing(null); setError(''); setDraft({ name: '', type: 'text', options: '', placement: 'customSection' }); }}><Plus size={16} /> Add Custom Field</Button>}
      </Section>

      <Section title="Data & Storage" accent="bg-journal-cloud">
        <Row label="Storage used" hint="Saved in this browser"><span className="font-mono text-sm">{usage.total.toFixed(1)} KB</span></Row>
        <ul className="text-xs text-gray-400 space-y-1">{usage.rows.map(row => <li key={row.key} className="flex justify-between"><span>{row.key}</span><span>{row.kb.toFixed(1)} KB</span></li>)}</ul>
        <CodeDatabase hideCustomFields />
      </Section>

      <Section title="About & System Info" accent="bg-journal-keep">
        <Row label="App version"><span className="font-mono text-sm">{APP_VERSION}</span></Row>
        <Row label="Total records"><span className="font-mono text-sm">{projects.length}</span></Row>
        <Row label="Custom fields"><span className="font-mono text-sm">{fields.length}</span></Row>
        <Row label="Starting data"><span className="font-mono text-sm">Backup 11-16-2026</span></Row>
      </Section>
    </div>
  );
}
