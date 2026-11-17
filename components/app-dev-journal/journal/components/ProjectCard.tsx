// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { fieldsAt, loadSettings } from '../settings';
import { Check, ChevronDown, ChevronUp, Download, Edit2, Save, Trash2, Star, Printer, ArrowUp, ArrowDown, Image, X, Eye, EyeOff, Calendar } from 'lucide-react';
import { Project, Note } from '../types';
import MultiSelect from './MultiSelect';
import { defaultPlatforms, defaultAiAgents, defaultAiTools, defaultCloudServices, defaultUserNames, defaultAccounts } from '../types';
import SpeechToText from './SpeechToText';
import ImageGallery from './ImageGallery';
import PrintPreview from './PrintPreview';
import DateField from './DateField';
import { formatDate, formatDateTime } from '../dates';
import { useSharedOptions } from '../sharedOptions';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
  color: string;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean, scrollToTop?: boolean) => void;
  onExport: () => void;
  onAddTodo: (content: string, projectId: string, projectName: string, noteType: string, note?: Note) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function ProjectCard({
  project,
  onUpdate,
  onDelete,
  color,
  isExpanded,
  onToggleExpand,
  onExport,
  onAddTodo,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: ProjectCardProps) {
  const [editedProject, setEditedProject] = useState<Project>({
    ...project,
    platforms: project.platforms || [],
    aiAgents: project.aiAgents || [],
    aiTools: project.aiTools || [],
    cloudServices: project.cloudServices || [],
    userNames: project.userNames || [],
    customPlatform: project.customPlatform || '',
    customAiAgent: project.customAiAgent || '',
    customAiTools: project.customAiTools || '',
    customCloudService: project.customCloudService || '',
    customUserName: project.customUserName || '',
    screenshots: project.screenshots || [],
    isDeployed: project.isDeployed || false,
    deployedDate: project.deployedDate || '',
    deployedFrom: project.deployedFrom || '',
    publishedFrom: project.publishedFrom || ''
  });
  const sharedOptions = useSharedOptions();
  useEffect(() => setEditedProject({ ...project, screenshots: project.screenshots || [] }), [project]);

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [jumpTarget, setJumpTarget] = useState<string | null>(null);
  const [coverCollapsed, setCoverCollapsed] = useState(false);
  const tap = React.useRef<{ field: string; time: number } | null>(null);
  const pointerStart = React.useRef<{ x: number; y: number } | null>(null);
  const jump = (field: string) => { setJumpTarget(field); setCoverCollapsed(true); if (!isExpanded) onToggleExpand(true, false); };
  useEffect(() => {
    if (!isExpanded || !jumpTarget) return;
    const frame = requestAnimationFrame(() => {
      const section = Array.from(cardRef.current?.querySelectorAll<HTMLElement>('[data-section]') || []).find(el => el.dataset.section === jumpTarget);
      section?.scrollIntoView({ behavior: 'auto', block: 'start' });
      setJumpTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [isExpanded, jumpTarget]);
  useEffect(() => {
    const reveal = () => { if (window.scrollY < 10) setCoverCollapsed(false); };
    window.addEventListener('scroll', reveal, { passive: true });
    return () => window.removeEventListener('scroll', reveal);
  }, []);
  const coverEvents = (field: string) => ({
    'data-cover-field': field,
    onDoubleClick: () => jump(field),
    onPointerDown: (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') pointerStart.current = { x: e.clientX, y: e.clientY }; },
    onPointerCancel: () => { pointerStart.current = null; tap.current = null; },
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const start = pointerStart.current; pointerStart.current = null;
      if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) { tap.current = null; return; }
      const now = Date.now();
      if (tap.current?.field === field && now - tap.current.time < 350) { tap.current = null; jump(field); }
      else tap.current = { field, time: now };
    },
  });
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);

  useEffect(() => {
    // Load custom fields from localStorage
    const savedFields = localStorage.getItem('customFields');
    if (savedFields) {
      setCustomFields(JSON.parse(savedFields));
    }
  }, []);

  const notes = [
    { title: 'General Notes', field: 'initialRequestNotes' },
    { title: 'Current Request Notes', field: 'currentRequestNotes' },
    { title: 'What Was Done', field: 'whatWasDone' },
    { title: 'What Needs Fixed', field: 'whatNeedsFixed' }
  ];

  const getLatestUpdate = () => {
    const allNotes = [
      { type: 'Initial Request Notes', note: editedProject.initialRequestNotes },
      { type: 'Current Request Notes', note: editedProject.currentRequestNotes },
      { type: 'What Was Done', note: editedProject.whatWasDone },
      { type: 'What Needs Fixed', note: editedProject.whatNeedsFixed }
    ];

    const latestNote = allNotes.reduce((latest, current) => {
      if (!latest.note.lastUpdated) return current;
      if (!current.note.lastUpdated) return latest;
      return new Date(current.note.lastUpdated) > new Date(latest.note.lastUpdated) ? current : latest;
    });

    return latestNote.note.lastUpdated ? `${latestNote.type}: ${latestNote.note.lastUpdated}` : 'No updates yet';
  };

  const handleChange = (field: keyof Project, value: any) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
    onUpdate({ ...editedProject, [field]: value });
  };

  const handleNoteChange = (field: keyof Project, content: string) => {
    if ((editedProject[field] as Note).content === content) return;
    const now = new Date().toLocaleString();
    const updatedNote: Note = {
      content,
      lastUpdated: now,
      isChecked: (editedProject[field] as Note).isChecked
    };
    setEditedProject(prev => ({ ...prev, [field]: updatedNote }));
    onUpdate({ ...editedProject, [field]: updatedNote });
  };

  const handleNoteCheck = (field: keyof Project) => {
    const note = editedProject[field] as Note;
    const updatedNote: Note = {
      ...note,
      isChecked: !note.isChecked,
      lastUpdated: new Date().toLocaleString()
    };
    
    if (!note.isChecked && note.content) {
      const noteType = notes.find(n => n.field === field)?.title || '';
      onAddTodo(
        note.content,
        project.id,
        editedProject.appName || 'Untitled Project',
        noteType,
        note
      );
    }
    
    setEditedProject(prev => ({ ...prev, [field]: updatedNote }));
    onUpdate({ ...editedProject, [field]: updatedNote });
  };

  const handleDelete = () => {
    if (showDeleteConfirm || !loadSettings().confirmDelete) {
      onDelete(project.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    window.print();
  };

  const handleAddImages = (newImages: string[]) => {
    const updatedProject = {
      ...editedProject,
      screenshots: [...(editedProject.screenshots || []), ...newImages]
    };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleRemoveImage = (index: number) => {
    const updatedScreenshots = [...(editedProject.screenshots || [])];
    updatedScreenshots.splice(index, 1);
    const updatedProject = {
      ...editedProject,
      screenshots: updatedScreenshots
    };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setEditedProject(prev => ({ ...prev, [fieldName]: value }));
    onUpdate({ ...editedProject, [fieldName]: value });
  };

  const renderPlaced = (placement) => {
    const placed = fieldsAt(customFields, placement);
    if (!placed.length) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-placement={placement}>
        {placed.map(field => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-1">{field.name}</label>
            {renderCustomField(field)}
          </div>
        ))}
      </div>
    );
  };

  // Render custom field based on its type
  const renderCustomField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={editedProject[field.name] || ''}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
            placeholder={`Enter ${field.name}...`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={editedProject[field.name] || ''}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
            placeholder={`Enter ${field.name}...`}
          />
        );
      case 'date':
        return (
          <DateField
            value={editedProject[field.name] || ''}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editedProject[field.name] || false}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.checked)}
              className="rounded bg-gray-700"
            />
            <span className="text-sm">Yes/No</span>
          </label>
        );
      case 'notes':
        return (
          <textarea
            value={editedProject[field.name] || ''}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="w-full bg-gray-800 rounded p-2 min-h-[100px]"
            placeholder={`Enter ${field.name}...`}
          />
        );
      case 'dropdown':
        return (
          <select
            value={editedProject[field.name] || ''}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
          >
            <option value="">Select an option</option>
            {(sharedOptions?.options(field.name, field.options || []) || field.options || []).map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkboxes':
        return (
          <MultiSelect label={field.name} options={field.options || []} selected={editedProject[field.name] || []}
            onChange={selected => handleCustomFieldChange(field.name, selected)} />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={cardRef} className={`rounded-lg border border-gray-700 ${color}`}>
      <div className={`p-4 rounded-t-lg journal-cover ${isExpanded ? 'journal-cover-sticky' : ''} ${isExpanded && coverCollapsed ? 'journal-cover-collapsed' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 journal-cover-details">
          <div className="space-y-2 divide-y divide-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedProject.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder="App Name"
                className="text-xl font-bold bg-transparent border-none p-0 w-full min-w-0 focus:ring-0"
              />
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Platforms')}>
                <span className="text-blue-400 font-medium">Platforms: </span>
                <span className="text-gray-400">{editedProject.platforms.join('; ')}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('AI Agents')}>
                <span className="text-journal-label font-medium">AI Agents: </span>
                <span className="text-gray-400">{editedProject.aiAgents.join('; ')}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Google Keep')}>
                <span className="text-journal-keep font-medium">Google Keep: </span>
                <span className="text-gray-400">{(editedProject.googleKeepAccounts || []).join(', ')}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Google Account')}>
                <span className="text-purple-400 font-medium">Google Account: </span>
                <span className="text-gray-400">{editedProject.userNames.join(', ')}</span>
              </div>
            </div>
            {editedProject.currentRequestNotes.lastUpdated && (
              <div className="pt-2">
                <div className="text-sm" {...coverEvents('currentRequestNotes')}>
                  <span className="text-green-400 font-medium">Current Request Updated: </span>
                  <span className="text-gray-400">{formatDateTime(editedProject.currentRequestNotes.lastUpdated)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 divide-y divide-gray-700">
            <div className="text-sm" {...coverEvents('Last Request Date')}>
              <span className="text-yellow-400 font-medium">Last Request Date: </span>
              <span className="text-gray-400">{formatDate(editedProject.currentRequestDate)}</span>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Project Dir')}>
                <span className="text-orange-400 font-medium">Project Dir: </span>
                <span className="text-gray-400 break-all">{editedProject.previewUrl}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Local Host')}>
                <span className="text-teal-400 font-medium">Local Host: </span>
                <span className="text-gray-400 break-all">{editedProject.localHost || ''}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Published URL')}>
                <span className="text-red-400 font-medium">Published URL: </span>
                <span className="text-gray-400 break-all">{editedProject.publishedUrl}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm" {...coverEvents('Cloud Services')}>
                <span className="text-journal-cloud font-medium">Cloud Services: </span>
                <span className="text-gray-400">{editedProject.cloudServices.join('; ')}</span>
              </div>
            </div>
            {editedProject.isDeployed && (
              <div className="pt-2">
                <div className="text-sm" {...coverEvents('Deployed Date')}>
                  <span className="text-green-400 font-medium">Deployed: </span>
                  <span className="text-gray-400">
                    {formatDate(editedProject.deployedDate)} from {editedProject.deployedFrom}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        {isExpanded && <Button variant="ghost" size="sm" className="journal-cover-reveal" aria-label={coverCollapsed ? 'Reveal record cover' : 'Compact record cover'} onClick={() => setCoverCollapsed(v => !v)}>{coverCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}{editedProject.appName || 'Record'}</Button>}
        <div className="flex flex-wrap items-center gap-2 mt-4 justify-end journal-record-actions">
          {isExpanded && editedProject.modifiedAt && <span className="mr-auto text-xs italic text-journal-label" aria-label="Record modified">Modified: {formatDate(editedProject.modifiedAt)} {new Date(editedProject.modifiedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>}
          {!isFirst && onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Move record up"
            >
              <ArrowUp size={20} />
            </button>
          )}
          {!isLast && onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Move record down"
            >
              <ArrowDown size={20} />
            </button>
          )}
          <button
            aria-label="Favorite record" title="Favorite record"
            onClick={() => handleChange('isFavorite', !editedProject.isFavorite)}
            className={`p-2 hover:bg-gray-700 rounded ${editedProject.isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
          >
            <Star size={20} />
          </button>
          <Button variant="ghost" size="icon" title={editedProject.isHidden ? 'Show Record' : 'Hide Record'} aria-label={editedProject.isHidden ? 'Show Record' : 'Hide Record'} onClick={() => handleChange('isHidden', !editedProject.isHidden)}>{editedProject.isHidden ? <EyeOff size={20} /> : <Eye size={20} />}</Button>
          <button
            onClick={() => setShowGallery(true)}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white relative"
            title="Screenshots"
          >
            <Image size={20} />
            {(editedProject.screenshots?.length || 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {editedProject.screenshots?.length}
              </span>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Print record"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={onExport}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 hover:bg-gray-700 rounded ${showDeleteConfirm ? 'bg-red-600 text-white' : 'text-red-400'}`}
            title={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete record'}
          >
            <Trash2 size={20} />
          </button>
          <Button variant="ghost" size="icon"
            onClick={() => onToggleExpand(!isExpanded)}
            aria-label={isExpanded ? 'Close record' : 'Open record'}
            title={isExpanded ? 'Close record' : 'Open record'}
          >
            {isExpanded ? <X size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6 bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Initial Request Date</label>
              <DateField
                aria-label="Initial Request Date"
                value={editedProject.initialRequestDate}
                onChange={(e) => handleChange('initialRequestDate', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 journal-field-section" data-section="Last Request Date">Last Request Date</label>
              <DateField
                aria-label="Last Request Date"
                value={editedProject.currentRequestDate}
                onChange={(e) => handleChange('currentRequestDate', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              />
            </div>
          </div>
          {renderPlaced('afterDates')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MultiSelect
              label="Platforms"
              accountOptions={defaultAccounts}
              options={defaultPlatforms}
              selected={editedProject.platforms || []}
              onChange={(selected) => handleChange('platforms', selected)}
              customValue={editedProject.customPlatform}
              onCustomChange={(value) => handleChange('customPlatform', value)}
            />
            <div className="space-y-4 min-w-0">
            <MultiSelect
              label="AI Agents"
              accountOptions={defaultAccounts}
              options={defaultAiAgents}
              selected={editedProject.aiAgents || []}
              onChange={(selected) => handleChange('aiAgents', selected)}
              customValue={editedProject.customAiAgent}
              onCustomChange={(value) => handleChange('customAiAgent', value)}
            />
            <MultiSelect label="Google Keep" options={defaultAccounts} selected={editedProject.googleKeepAccounts || []}
              onChange={selected => handleChange('googleKeepAccounts', selected)} customValue={editedProject.customGoogleKeepAccount || ''}
              onCustomChange={value => handleChange('customGoogleKeepAccount', value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MultiSelect
              label="AI Tools"
              accountOptions={defaultAccounts}
              options={defaultAiTools}
              selected={editedProject.aiTools || []}
              onChange={(selected) => handleChange('aiTools', selected)}
              customValue={editedProject.customAiTools}
              onCustomChange={(value) => handleChange('customAiTools', value)}
            />
            <MultiSelect
              label="Cloud Services"
              accountOptions={defaultAccounts}
              options={defaultCloudServices}
              selected={editedProject.cloudServices || []}
              onChange={(selected) => handleChange('cloudServices', selected)}
              customValue={editedProject.customCloudService}
              onCustomChange={(value) => handleChange('customCloudService', value)}
            />
          </div>
          {renderPlaced('afterTechnologies')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <MultiSelect
              label="Google Account"
              options={defaultUserNames}
              selected={editedProject.userNames || []}
              onChange={(selected) => handleChange('userNames', selected)}
              customValue={editedProject.customUserName}
              onCustomChange={(value) => handleChange('customUserName', value)}
            />
            <div>
              <label className="block text-sm font-medium mb-1 journal-field-section" data-section="Local Host">Local Host</label>
              <input
                type="text"
                value={editedProject.localHost || ''}
                onChange={(e) => handleChange('localHost', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
                placeholder="e.g., http://localhost:5173"
              />
            </div>
          </div>
          {renderPlaced('afterAccounts')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Last Good Restore Point</label>
              <div className="relative">
                <input
                  type="text"
                  value={editedProject.lastGoodRestorePoint}
                  onChange={(e) => handleChange('lastGoodRestorePoint', e.target.value)}
                  className="w-full bg-gray-800 rounded p-2 pl-10"
                  placeholder="e.g., #1 - Initial setup"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">#</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Add a number and description (e.g., "#1 - Initial setup")
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Restore Point</label>
              <div className="relative">
                <input
                  type="text"
                  value={editedProject.currentRestorePoint}
                  onChange={(e) => handleChange('currentRestorePoint', e.target.value)}
                  className="w-full bg-gray-800 rounded p-2 pl-10"
                  placeholder="e.g., #2 - Added authentication"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">#</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use incremental numbers for easy tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 journal-field-section" data-section="Project Dir">Project Dir</label>
              <input
                type="text"
                value={editedProject.previewUrl}
                onChange={(e) => handleChange('previewUrl', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 journal-field-section" data-section="Published URL">Published URL</label>
              <input
                type="url"
                value={editedProject.publishedUrl}
                onChange={(e) => handleChange('publishedUrl', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              />
            </div>
          </div>
          {renderPlaced('afterUrls')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Published From</label>
              <input
                type="text"
                value={editedProject.publishedFrom}
                onChange={(e) => handleChange('publishedFrom', e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
                placeholder="e.g., GitHub, Netlify, Vercel"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedProject.isDeployed}
                  onChange={(e) => handleChange('isDeployed', e.target.checked)}
                  className="rounded bg-gray-700"
                />
                <span className="text-sm font-medium">App Deployed?</span>
              </label>
            </div>
          </div>

          {editedProject.isDeployed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 journal-field-section" data-section="Deployed Date">Deployed Date</label>
                <div className="relative">
                  <DateField
                    aria-label="Deployed Date"
                    value={editedProject.deployedDate}
                    onChange={(e) => handleChange('deployedDate', e.target.value)}
                    className="w-full bg-gray-800 rounded p-2 pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deployed From</label>
                <input
                  type="text"
                  value={editedProject.deployedFrom}
                  onChange={(e) => handleChange('deployedFrom', e.target.value)}
                  className="w-full bg-gray-800 rounded p-2"
                  placeholder="e.g., Local, GitHub, CI/CD"
                />
              </div>
            </div>
          )}

          {/* Custom Fields Section */}
          {fieldsAt(customFields, 'customSection').length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldsAt(customFields, 'customSection').map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">{field.name}</label>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Notes</label>
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {notes.map(({ title, field }, index) => (
                  <div key={field} data-section={field} className="bg-gray-800 rounded p-4 journal-field-section">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{title}</h4>
                      <div className="flex items-center gap-2">
                        {(editedProject[field] as Note).lastUpdated && (
                          <span className="text-xs text-gray-400 italic">
                            Last updated: {formatDateTime((editedProject[field] as Note).lastUpdated)}
                          </span>
                        )}
                        <button
                          onClick={() => handleNoteCheck(field)}
                          className={`p-1 rounded ${
                            (editedProject[field] as Note).isChecked
                              ? 'bg-green-600'
                              : 'bg-gray-600'
                          }`}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        value={(editedProject[field] as Note).content}
                        onChange={(e) => handleNoteChange(field, e.target.value)}
                        className="w-full bg-gray-700 rounded p-2 h-20 pr-12"
                        placeholder={title}
                      />
                      <div className="absolute right-2 top-2">
                        <SpeechToText
                          onTranscript={(text) => {
                            const currentContent = (editedProject[field] as Note).content;
                            handleNoteChange(field, currentContent ? `${currentContent} ${text}` : text);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {renderPlaced('afterNotes')}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Screenshots</label>
            <ImageGallery
              images={editedProject.screenshots || []}
              onAddImages={handleAddImages}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </div>
      )}

      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          <div className="w-full max-w-4xl p-4">
            <ImageGallery
              images={editedProject.screenshots || []}
              onAddImages={handleAddImages}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </div>
      )}

      {showPrintPreview && (
        <PrintPreview
          project={editedProject}
          onClose={() => setShowPrintPreview(false)}
          onPrint={handleActualPrint}
        />
      )}

      {isEditingNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[9999]">
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-700 bg-black">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {notes.map(({ title }, index) => (
                <button
                  key={index}
                  onClick={() => setActiveNoteIndex(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeNoteIndex === index ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsEditingNotes(false)}
              className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2 ml-4"
            >
              <Save size={16} /> Save & Close
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400 italic">
                Last updated: {formatDateTime((editedProject[notes[activeNoteIndex].field] as Note).lastUpdated) || 'Never'}
              </span>
              <button
                onClick={() => handleNoteCheck(notes[activeNoteIndex].field)}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  (editedProject[notes[activeNoteIndex].field] as Note).isChecked
                    ? 'bg-green-600'
                    : 'bg-gray-600'
                }`}
              >
                <Check size={16} />
                {(editedProject[notes[activeNoteIndex].field] as Note).isChecked ? 'Added to Todo' : 'Add to Todo'}
              </button>
            </div>
            <textarea
              value={(editedProject[notes[activeNoteIndex].field] as Note).content}
              onChange={(e) => handleNoteChange(notes[activeNoteIndex].field, e.target.value)}
              className="w-full h-[calc(100vh-12rem)] bg-gray-800 rounded-lg p-4 resize-none"
              placeholder={notes[activeNoteIndex].title}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;