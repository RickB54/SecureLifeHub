// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, HelpCircle, ArrowUp, ArrowUpDown, RotateCcw, ChevronsDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import Settings from './components/Settings';
import CheckboxFilter from './components/CheckboxFilter';
import { loadSettings, saveSettings, type JournalSettings } from './settings';
import { Button } from '@/components/ui/button';
import { restoreStartingData, sanitizeSpelling, withModification, removeSharedItem } from './backupData';
import { SharedOptionsContext, sectionFields, type OptionRegistry } from './sharedOptions';
import ExportMenu from './components/ExportMenu';
import { type SpreadsheetSort } from './coverSpreadsheet';
import { formatDate } from './dates';
import { journalRecords, FAVORITES_FILTER, HIDDEN_FILTER, recordFilterOptions, recordSortLabels, type RecordSort } from './recordView';
import { Project, AppIdea, TodoItem } from './types';
import ProjectCard from './components/ProjectCard';
import BottomNav from './components/BottomNav';
import TodoCalendar from './components/TodoCalendar';
import AppIdeas from './components/AppIdeas';
import { reportFields } from './reportData';
import Help from './components/Help';
import { journalHelpSections } from './helpSections';

function App() {
  const [projects, setProjects] = useState<Project[]>(() => restoreStartingData(localStorage));
  const [settings, setSettingsState] = useState<JournalSettings>(() => loadSettings());
  const setSettings = (next: JournalSettings) => { setSettingsState(next); saveSettings(next); };
  const [registry, setRegistry] = useState<OptionRegistry>(() => sanitizeSpelling(JSON.parse(localStorage.getItem('journal-shared-options') || '{"added":{},"deleted":{}}')));
  useEffect(() => { localStorage.setItem('journal-shared-options', JSON.stringify(registry)); }, [registry]);
  const sharedOptions = useMemo(() => ({
    options: (section: string, defaults: string[]) => {
      const field = sectionFields[section] || section;
      const values = projects.flatMap(project => project[field] || []).map(value => String(value).split(', ')[0]);
      return [...new Set(sanitizeSpelling([...defaults, ...(registry.added[section] || []), ...values]))].filter(value => !(registry.deleted[section] || []).includes(value));
    },
    add: (section: string, value: string) => {
      value = sanitizeSpelling(value);
      setRegistry(previous => ({ added: { ...previous.added, [section]: [...new Set([...(previous.added[section] || []), value])] }, deleted: { ...previous.deleted, [section]: (previous.deleted[section] || []).filter(item => item !== value) } }));
    },
    remove: (section: string, value: string) => {
      if (!window.confirm(`Delete ${value} from ${section} in all records?`)) return;
      setRegistry(previous => ({ added: { ...previous.added, [section]: (previous.added[section] || []).filter(item => item !== value) }, deleted: { ...previous.deleted, [section]: [...new Set([...(previous.deleted[section] || []), value])] } }));
      setProjects(previous => removeSharedItem(previous, sectionFields[section] || section, value));
    },
  }), [projects, registry]);

  const [ideas, setIdeas] = useState<AppIdea[]>(() => {
    const saved = localStorage.getItem('ideas');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState(() => settings.defaultTab);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => {
    const last = settings.rememberLastRecord ? localStorage.getItem('journal-last-record') : null;
    return new Set(last && projects.some(p => p.id === last) ? [last] : []);
  });
  const [showHelp, setShowHelp] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [spreadsheetSort, setSpreadsheetSort] = useState<SpreadsheetSort>(() => settings.defaultSort);
  const [filterValues, setFilterValues] = useState<string[]>([]);
  const [appIds, setAppIds] = useState<string[]>([]);
  const [pendingRecord, setPendingRecord] = useState<string | null>(null);
  const isRecordView = ['projects', 'favorites', 'hidden'].includes(currentView);
  const pageProjects = useMemo(() => currentView === 'hidden' ? projects.filter(p => p.isHidden) : currentView === 'favorites' ? projects.filter(p => p.isFavorite && (!p.isHidden || settings.showHiddenRecords)) : projects, [projects, currentView, settings.showHiddenRecords]);
  const filteredProjects = useMemo(() => journalRecords(appIds.length ? pageProjects.filter(p => appIds.includes(p.id)) : pageProjects, spreadsheetSort, filterValues, searchTerm, sortDirection, settings.showHiddenRecords || currentView === 'hidden'), [pageProjects, appIds, spreadsheetSort, filterValues, searchTerm, sortDirection, settings.showHiddenRecords, currentView]);
  const filterLabel = [filterValues.map(v => v === FAVORITES_FILTER ? 'Favorites' : v === HIDDEN_FILTER ? 'Hidden Records' : v).join(', '), appIds.length ? `${appIds.length} apps` : ''].filter(Boolean).join('; ');
  const focusedId = isRecordView ? [...expandedCards][0] : undefined;
  const shownProjects = focusedId ? projects.filter(p => p.id === focusedId) : filteredProjects;
  const filterOptions = useMemo(() => [...recordFilterOptions(pageProjects, spreadsheetSort), FAVORITES_FILTER, HIDDEN_FILTER], [pageProjects, spreadsheetSort]);
  const latestProjects = React.useRef(projects);
  const dirty = React.useRef(false);
  const flushSave = React.useCallback(() => {
    if (!dirty.current) return;
    localStorage.setItem('projects', JSON.stringify(latestProjects.current));
    dirty.current = false;
  }, []);
  useEffect(() => {
    latestProjects.current = projects;
    dirty.current = true;
    if (!settings.autoSave) return;
    const timer = setTimeout(flushSave, settings.autoSaveDelay);
    return () => clearTimeout(timer);
  }, [projects, settings.autoSave, settings.autoSaveDelay, flushSave]);
  useEffect(() => {
    window.addEventListener('pagehide', flushSave);
    window.addEventListener('journal-before-data-operation', flushSave);
    return () => { window.removeEventListener('pagehide', flushSave); window.removeEventListener('journal-before-data-operation', flushSave); };
  }, [flushSave]);
  useEffect(() => {
    if (focusedId) localStorage.setItem('journal-last-record', focusedId);
  }, [focusedId]);
  useEffect(() => {
    document.documentElement.classList.toggle('journal-theme-light', settings.theme === 'light');
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const headerRef = React.useRef<HTMLDivElement>(null);
  const [headerRevealed, setHeaderRevealed] = useState(false);
  const headerHidden = Boolean(focusedId) && !headerRevealed;
  const pullDragged = React.useRef(false);
  const pullStart = React.useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { setHeaderRevealed(false); }, [focusedId]);
  useEffect(() => {
    const element = headerRef.current;
    if (!element) { document.documentElement.style.setProperty('--journal-header-height', '0px'); return; }
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--journal-header-height', headerHidden ? '0px' : `${element.getBoundingClientRect().height}px`));
    document.documentElement.style.setProperty('--journal-header-height', headerHidden ? '0px' : `${element.getBoundingClientRect().height}px`);
    observer.observe(element); return () => observer.disconnect();
  }, [currentView, headerHidden]);

  const changeSort = (criteria: RecordSort) => {
    setSpreadsheetSort(criteria);
    setFilterValues([]);
    setSortDirection('asc');
  };

  useEffect(() => {
    if (filterValues.some(value => !filterOptions.includes(value))) setFilterValues(filterValues.filter(value => filterOptions.includes(value)));
  }, [filterOptions, filterValues]);
  useEffect(() => {
    if (appIds.some(id => !projects.some(p => p.id === id))) setAppIds(appIds.filter(id => projects.some(p => p.id === id)));
  }, [projects, appIds]);

  useEffect(() => {
    if (!pendingRecord || !isRecordView) return;
    const element = document.getElementById(`project-${pendingRecord}`);
    if (!element) return;
    element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    setPendingRecord(null);
  }, [pendingRecord, currentView, shownProjects]);

  const addProject = () => {
    setCurrentView('projects'); setAppIds([]);
    const newProject: Project = {
      id: Date.now().toString(),
      appName: '',
      platforms: [],
      aiAgents: [],
      googleKeepAccounts: [],
      aiTools: [],
      cloudServices: [],
      userNames: [],
      initialRequestDate: '',
      currentRequestDate: '',
      lastGoodRestorePoint: '',
      currentRestorePoint: '',
      initialRequestNotes: { content: '', lastUpdated: '', isChecked: false },
      currentRequestNotes: { content: '', lastUpdated: '', isChecked: false },
      whatWasDone: { content: '', lastUpdated: '', isChecked: false },
      whatNeedsFixed: { content: '', lastUpdated: '', isChecked: false },
      previewUrl: '',
      publishedUrl: '',
      customPlatform: '',
      customAiAgent: '',
      customAiTools: '',
      customCloudService: '',
      customUserName: '',
      order: 0, // Set to 0 to ensure it's at the top
      isFavorite: false,
      isDeployed: false,
      deployedDate: '',
      deployedFrom: '',
      publishedFrom: ''
    };

    changeSort('order');
    setSearchTerm('');

    // Update order of existing projects
    const updatedProjects = projects.map(p => ({
      ...p,
      order: p.order + 1
    }));

    // Add new project at the beginning and expand it
    setProjects([newProject, ...updatedProjects]);
    setExpandedCards(new Set([newProject.id]));

    // Scroll to top after a short delay to ensure the DOM has updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(previous => previous.map(p => p.id === updatedProject.id ? withModification(p, sanitizeSpelling(updatedProject)) : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const addIdea = (content: string) => {
    const newIdea: AppIdea = {
      id: Date.now().toString(),
      content,
      dateCreated: new Date().toISOString()
    };
    setIdeas([newIdea, ...ideas]);
  };

  const updateIdea = (id: string, content: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, content } : idea
    ));
  };

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const addTodo = (content: string, projectId: string, projectName: string, noteType: string, note?: Note) => {
    const isDuplicate = todos.some(todo => 
      todo.content === content && 
      todo.projectId === projectId && 
      !todo.completed
    );

    if (!isDuplicate) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        content,
        projectId,
        projectName,
        noteType,
        dateCreated: new Date().toISOString(),
        completed: false,
        priority: 'medium',
        category: 'work',
        dueDate: undefined,
        notes: undefined,
        assignedTo: undefined,
        tags: [],
        linkedNotes: note ? [note] : undefined
      };
      setTodos(prevTodos => [newTodo, ...prevTodos]);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const closeRecord = (id?: string) => {
    flushSave();
    setExpandedCards(new Set());
    if (id) setPendingRecord(id);
  };
  const openRecord = (id: string, scrollToTop = true) => {
    setExpandedCards(new Set([id]));
    if (scrollToTop) setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30);
  };
  const handleCollapseAll = () => {
    if (focusedId) closeRecord(focusedId);
    else if (filteredProjects[0]) openRecord(filteredProjects[0].id);
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = filteredProjects[index];
    const target = filteredProjects[targetIndex];
    if (!current || !target) return;
    const displayOrder = [...filteredProjects];
    [displayOrder[index], displayOrder[targetIndex]] = [target, current];
    const visibleIds = new Set(displayOrder.map(project => project.id));
    setProjects([...displayOrder, ...projects.filter(project => !visibleIds.has(project.id))].map((project, order) => ({ ...project, order })));
    setSpreadsheetSort('order');
    setFilterValues([]);
    setAppIds([]);
  };

  const navigateToRecord = (projectId: string) => {
    if (!projects.some(project => project.id === projectId)) return;
    if (!isRecordView) setCurrentView('projects');
    openRecord(projectId);
  };

  const exportToCsv = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const headers = [
      'App Name',
      'Platforms',
      'AI Agents',
      'AI Tools',
      'Cloud Services',
      'Google Account',
      'Initial Request Date',
      'Last Request Date',
      'Last Good Restore Point',
      'Current Restore Point',
      'Initial Request Notes',
      'Current Request Notes',
      'What Was Done',
      'What Needs Fixed',
      'Project Dir',
      'Local Host',
      'Published URL',
      'Deployed Date',
      'Deployed From',
      'Published From'
    ];

    const data = [
      project.appName,
      project.platforms.join(';'),
      project.aiAgents.join(';'),
      project.aiTools.join(';'),
      project.cloudServices.join(';'),
      project.userNames.join(';'),
      formatDate(project.initialRequestDate),
      formatDate(project.currentRequestDate),
      project.lastGoodRestorePoint,
      project.currentRestorePoint,
      project.initialRequestNotes.content,
      project.currentRequestNotes.content,
      project.whatWasDone.content,
      project.whatNeedsFixed.content,
      project.previewUrl,
      project.localHost || '',
      project.publishedUrl,
      formatDate(project.deployedDate),
      project.deployedFrom,
      project.publishedFrom
    ];

    const csvContent = [
      headers.join(','),
      data.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.appName || 'project'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SharedOptionsContext.Provider value={sharedOptions}><div className={`min-h-screen bg-[#121212] text-white pb-20 journal-theme-${settings.theme} journal-density-${settings.density}`}>
      <div className="max-w-6xl mx-auto p-4">
        {isRecordView && (
          <>
            {focusedId && <Button variant="secondary" aria-label={headerHidden ? 'Reveal header' : 'Hide header'} title={headerHidden ? 'Reveal header' : 'Hide header'} className="journal-header-handle" onClick={() => { if (pullDragged.current) { pullDragged.current = false; return; } setHeaderRevealed(value => !value); }} onPointerDown={event => { pullDragged.current = false; pullStart.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={event => { const start = pullStart.current; pullStart.current = null; if (start && event.clientY - start.y > 24 && Math.abs(event.clientX - start.x) < 60) { pullDragged.current = true; setHeaderRevealed(true); event.preventDefault(); } }} onPointerCancel={() => { pullStart.current = null; }}>{headerHidden ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</Button>}
            <div ref={headerRef} inert={headerHidden} aria-hidden={headerHidden} className={`journal-header ${headerHidden ? 'journal-header-hidden' : ''}`}>
              <div className="journal-header-title grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <h1 className="min-w-0 truncate font-bold">{currentView === 'favorites' ? 'Favorite Records' : currentView === 'hidden' ? 'Hidden Records' : 'App Development Journal'}</h1>
                <p role="status" aria-label="Record count" className="text-xs text-journal-label shrink-0">{filteredProjects.length} of {projects.length} records</p>
              </div>
              <div className="journal-header-exports flex items-center gap-1">
                <span className="sm:hidden text-journal-label text-[10px]" aria-label="Mobile record count">{filteredProjects.length}/{projects.length}</span>
                <ExportMenu kind="pdf" projects={pageProjects} filtered={filteredProjects} sort={spreadsheetSort} direction={sortDirection} filter={filterLabel} search={searchTerm} defaultScope={settings.exportScope} defaultOrientation={settings.pdfOrientation} />
                <ExportMenu kind="xlsx" projects={pageProjects} filtered={filteredProjects} sort={spreadsheetSort} direction={sortDirection} filter={filterLabel} search={searchTerm} defaultScope={settings.exportScope} defaultOrientation={settings.pdfOrientation} />
                <Button variant="secondary" size="icon" aria-label="Help" title="Help" onClick={() => setShowHelp(true)}><HelpCircle size={18} /></Button>
              </div>
              <div className="journal-header-filters">
                <select aria-label="Sort records" value={spreadsheetSort} onChange={e => changeSort(e.target.value as RecordSort)} className="journal-sort-menu min-w-0 rounded border border-input bg-secondary text-secondary-foreground px-2 h-8 text-xs">
                  {Object.entries(recordSortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <Button variant="secondary" size="icon" title={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'} aria-label={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'} disabled={spreadsheetSort === 'order'} onClick={() => setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc')}><ArrowUpDown size={16} /></Button>
                <CheckboxFilter label={recordSortLabels[spreadsheetSort]} allLabel={`All ${recordSortLabels[spreadsheetSort]}`} selected={filterValues} onChange={values => { setFilterValues(values); if (focusedId) closeRecord(); }} options={filterOptions.map(value => ({ value, label: value === FAVORITES_FILTER ? 'Favorites' : value === HIDDEN_FILTER ? 'Hidden Records' : spreadsheetSort === 'updatedDate' || spreadsheetSort === 'creationDate' ? formatDate(value) : value }))} />
                <CheckboxFilter label="Go to Record" allLabel="All apps" selected={appIds} onChange={ids => { setAppIds(ids); if (focusedId) closeRecord(); }} onOpenItem={navigateToRecord} options={[...pageProjects].sort((a, b) => a.appName.localeCompare(b.appName)).map(project => ({ value: project.id, label: project.appName || 'Untitled record', favorite: project.isFavorite, hidden: project.isHidden }))} />
                <Button variant="secondary" size="icon" aria-label="Reset filters and sorting" title="Reset filters and sorting" onClick={() => { changeSort('platform'); setSearchTerm(''); setAppIds([]); }}><RotateCcw size={16} /></Button>
              </div>
              <div className="journal-header-search grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1">
                <input aria-label="Search projects" placeholder="Search projects…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="min-w-0 w-full rounded px-2 py-1 text-xs" />
                <Button size="icon" aria-label="Add Record" title="Add Record" onClick={addProject}><Plus size={16} /></Button>
                <Button variant="secondary" size="icon" aria-label="Collapse / Expand" title="Collapse / Expand" onClick={handleCollapseAll}><ChevronsDownUp size={18} /></Button>
              </div>
            </div>


            <div className="space-y-4 journal-records-section">
              {!focusedId && currentView !== 'projects' && <nav aria-label={`${currentView === 'favorites' ? 'Favorites' : 'Hidden'} quick jumps`} className="journal-quick-jumps">{filteredProjects.map(project => <Button key={project.id} variant="ghost" size="sm" onClick={() => navigateToRecord(project.id)} className="h-auto whitespace-normal text-left justify-start text-journal-label">{project.appName || 'Untitled record'}</Button>)}</nav>}
              {shownProjects.map((project, index) => (
                <div
                  key={project.id}
                  id={`project-${project.id}`}
                >
                  <ProjectCard
                    project={project}
                    onUpdate={updateProject}
                    onDelete={deleteProject}
                    color="bg-gray-900"
                    isExpanded={expandedCards.has(project.id)}
                    onToggleExpand={(expanded, scrollToTop = true) => expanded ? openRecord(project.id, scrollToTop) : closeRecord(project.id)}
                    onExport={() => exportToCsv(project.id)}
                    onAddTodo={addTodo}
                    onMoveUp={() => moveProject(index, 'up')}
                    onMoveDown={() => moveProject(index, 'down')}
                    isFirst={index === 0}
                    isLast={index === shownProjects.length - 1}
                  />
                </div>
              ))}
              {shownProjects.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  {searchTerm || filterLabel ? 'No matching projects found' : 'No projects yet. Click "Add Record" to create one!'}
                </div>
              )}
            </div>
          </>
        )}

        {currentView === 'todo' && (
          <TodoCalendar
            todos={todos}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
            onNavigateToRecord={navigateToRecord}
          />
        )}

        {currentView === 'ideas' && (
          <AppIdeas
            ideas={ideas}
            onAddIdea={addIdea}
            onUpdateIdea={updateIdea}
            onDeleteIdea={deleteIdea}
          />
        )}

        {currentView === 'settings' && (
          <Settings settings={settings} onChange={setSettings} projects={projects} setProjects={setProjects} />
        )}

        {showHelp && (
          <Help
            title="App Development Journal Help"
            sections={journalHelpSections}
            onClose={() => setShowHelp(false)}
          />
        )}
      </div>

      <Button size="icon" aria-label="Back to top" title="Back to top" className="fixed bottom-24 right-4 z-40 border border-border" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><ArrowUp size={22} /></Button>

      {isRecordView && currentView !== 'projects' && <div className="journal-list-print"><h1>{currentView === 'favorites' ? 'Favorite Records' : 'Hidden Records'}</h1>{filteredProjects.map(project => <article key={project.id}>{reportFields(project).map(([label, value]) => <p key={label}><strong>{label}: </strong>{value}</p>)}</article>)}</div>}
      <BottomNav
        currentView={currentView}
        onNavChange={view => { flushSave(); setExpandedCards(new Set()); setAppIds([]); setFilterValues([]); setSearchTerm(''); setCurrentView(view); }}
      />
    </div></SharedOptionsContext.Provider>
  );
}

export default App;