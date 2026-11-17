// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Database, HelpCircle, Lock, AlertCircle, Key, Plus, X, Save, Edit2, List, CheckSquare, AlignLeft } from 'lucide-react';
import Help from './Help';
import { sanitizeSpelling, clearJournalData, restoreJournalBackup } from '../backupData';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'notes' | 'dropdown' | 'checkboxes';
  options?: string[]; // For dropdown and checkboxes types
}

export default function CodeDatabase({ hideCustomFields = false }: { hideCustomFields?: boolean }) {
  const [showHelp, setShowHelp] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [action, setAction] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const [recordCount, setRecordCount] = useState(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    return projects.length;
  });

  // Custom Fields State
  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    const saved = localStorage.getItem('customFields');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'boolean' | 'notes' | 'dropdown' | 'checkboxes'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  
  // Edit field state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldOptions, setEditFieldOptions] = useState('');

  useEffect(() => {
    localStorage.setItem('customFields', JSON.stringify(customFields));
  }, [customFields]);
  useEffect(() => {
    const sync = () => setCustomFields(JSON.parse(localStorage.getItem('customFields') || '[]'));
    window.addEventListener('journal-custom-fields', sync);
    return () => window.removeEventListener('journal-custom-fields', sync);
  }, []);

  const correctPin = localStorage.getItem('securityPin') || '1234'; // Default PIN

  const handleAddCustomField = () => {
    if (!sanitizeSpelling(newFieldName.trim())) {
      setFieldError("Field name cannot be empty");
      return;
    }

    // Check if field name already exists
    if (customFields.some(field => field.name.toLowerCase() === sanitizeSpelling(newFieldName.trim()).toLowerCase())) {
      setFieldError("A field with this name already exists");
      return;
    }

    // Check for reserved field names
    const reservedNames = [
      'id', 'appName', 'platforms', 'aiAgents', 'aiTools', 'cloudServices', 
      'userNames', 'initialRequestDate', 'currentRequestDate', 'lastGoodRestorePoint', 
      'currentRestorePoint', 'initialRequestNotes', 'currentRequestNotes', 
      'whatWasDone', 'whatNeedsFixed', 'previewUrl', 'publishedUrl', 
      'order', 'isFavorite', 'screenshots', 'isDeployed', 'deployedDate', 
      'deployedFrom', 'publishedFrom'
    ];

    if (reservedNames.includes(sanitizeSpelling(newFieldName.trim()).toLowerCase())) {
      setFieldError("This name is reserved by the system");
      return;
    }

    // Validate options for dropdown and checkboxes
    if ((newFieldType === 'dropdown' || newFieldType === 'checkboxes') && !newFieldOptions.trim()) {
      setFieldError("Options are required for dropdown and checkboxes fields");
      return;
    }

    setFieldError(null);
    
    // Process options for dropdown and checkboxes
    let options: string[] | undefined;
    if (newFieldType === 'dropdown' || newFieldType === 'checkboxes') {
      options = newFieldOptions.split(',').map(opt => sanitizeSpelling(opt.trim())).filter(opt => opt);
      if (options.length === 0) {
        setFieldError("At least one valid option is required");
        return;
      }
    }

    const newField: CustomField = {
      id: Date.now().toString(),
      name: sanitizeSpelling(newFieldName.trim()),
      type: newFieldType,
      options
    };

    // Add field to customFields
    setCustomFields(prev => [...prev, newField]);

    // Update all existing projects with the new field
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map(project => ({
      ...project,
      [sanitizeSpelling(newFieldName.trim())]: newFieldType === 'checkboxes' ? [] : null // Initialize with empty array for checkboxes
    }));
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // Reset form
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setShowAddField(false);
  };

  const handleEditField = (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!field) return;
    
    setEditingField(fieldId);
    setEditFieldName(field.name);
    setEditFieldOptions(field.options?.join(', ') || '');
  };

  const saveFieldEdit = (fieldId: string) => {
    const fieldIndex = customFields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;
    
    const field = customFields[fieldIndex];
    
    if (!sanitizeSpelling(editFieldName.trim())) {
      setFieldError("Field name cannot be empty");
      return;
    }

    // Check if the new name already exists (excluding the current field)
    if (editFieldName !== field.name && 
        customFields.some(f => f.id !== fieldId && f.name.toLowerCase() === sanitizeSpelling(editFieldName.trim()).toLowerCase())) {
      setFieldError("A field with this name already exists");
      return;
    }

    // Check for reserved field names
    const reservedNames = [
      'id', 'appName', 'platforms', 'aiAgents', 'aiTools', 'cloudServices', 
      'userNames', 'initialRequestDate', 'currentRequestDate', 'lastGoodRestorePoint', 
      'currentRestorePoint', 'initialRequestNotes', 'currentRequestNotes', 
      'whatWasDone', 'whatNeedsFixed', 'previewUrl', 'publishedUrl', 
      'order', 'isFavorite', 'screenshots', 'isDeployed', 'deployedDate', 
      'deployedFrom', 'publishedFrom'
    ];

    if (reservedNames.includes(sanitizeSpelling(editFieldName.trim()).toLowerCase())) {
      setFieldError("This name is reserved by the system");
      return;
    }

    // Validate options for dropdown and checkboxes
    if ((field.type === 'dropdown' || field.type === 'checkboxes') && !editFieldOptions.trim()) {
      setFieldError("Options are required for dropdown and checkboxes fields");
      return;
    }

    setFieldError(null);
    
    // Process options for dropdown and checkboxes
    let options: string[] | undefined;
    if (field.type === 'dropdown' || field.type === 'checkboxes') {
      options = editFieldOptions.split(',').map(opt => sanitizeSpelling(opt.trim())).filter(opt => opt);
      if (options.length === 0) {
        setFieldError("At least one valid option is required");
        return;
      }
    }

    // If the field name is changing, we need to update all projects
    if (editFieldName !== field.name) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedProjects = projects.map(project => {
        const { [field.name]: oldValue, ...rest } = project;
        return {
          ...rest,
          [sanitizeSpelling(editFieldName.trim())]: oldValue // Transfer the old value to the new field name
        };
      });
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }

    // Update the field
    const updatedFields = [...customFields];
    updatedFields[fieldIndex] = {
      ...field,
      name: sanitizeSpelling(editFieldName.trim()),
      options: options
    };
    
    setCustomFields(updatedFields);
    setEditingField(null);
    setEditFieldName('');
    setEditFieldOptions('');
  };

  const handleRemoveCustomField = (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!field) return;

    if (confirm(`Are you sure you want to remove the "${field.name}" field? This will remove this field from all records.`)) {
      // Remove field from customFields
      setCustomFields(prev => prev.filter(f => f.id !== fieldId));

      // Remove field from all projects
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedProjects = projects.map(project => {
        const { [field.name]: removed, ...rest } = project;
        return rest;
      });
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  const verifyPin = () => {
    if (pin === correctPin) {
      setShowPinInput(false);
      executeAction();
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  const handleChangePin = () => {
    if (currentPin !== correctPin) {
      alert('Current PIN is incorrect');
      return;
    }

    if (newPin !== confirmPin) {
      alert('New PINs do not match');
      return;
    }

    if (newPin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }

    localStorage.setItem('securityPin', newPin);
    alert('PIN changed successfully');
    setShowChangePinModal(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const executeAction = () => {
    switch (action) {
      case 'clear':
        handleClear();
        break;
      case 'backup':
        handleBackup();
        break;
      case 'restore':
        fileInputRef.current?.click();
        break;
      case 'export':
        handleExportCSV();
        break;
      case 'import':
        csvInputRef.current?.click();
        break;
      case 'changePin':
        setShowChangePinModal(true);
        break;
    }
    setPin('');
  };

  const handleAction = (actionType: string) => {
    setAction(actionType);
    setShowPinInput(true);
  };

  const handleBackup = () => {
    window.dispatchEvent(new Event('journal-before-data-operation'));
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `app_dev_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = sanitizeSpelling(JSON.parse(content));
          
          if (confirm('This will replace all current data. Are you sure you want to continue?')) {
            window.dispatchEvent(new Event('journal-before-data-operation'));
            restoreJournalBackup(localStorage, data);
            window.location.reload();
          }
        } catch (error) {
          alert('Error restoring data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    if (confirm('WARNING: This will permanently delete all your data. This action cannot be undone!')) {
      window.dispatchEvent(new Event('journal-before-data-operation'));
      clearJournalData(localStorage);
      setRecordCount(0);
      window.location.reload();
    }
  };

  const handleExportCSV = () => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // CSV Headers
    const headers = [
      "App Name",
      "Platforms",
      "AI Agents",
      "AI Tools",
      "Cloud Services",
      "Google Account",
      "Initial Request Date",
      "Last Request Date",
      "Last Good Restore Point",
      "Current Restore Point",
      "Initial Request Notes",
      "Current Request Notes",
      "What Was Done",
      "What Needs Fixed",
      "Preview URL",
      "Published URL",
      "Deployed Date",
      "Deployed From",
      "Published From",
      ...customFields.map(field => field.name)
    ];
    
    csvContent += headers.join(',') + '\n';

    // CSV Data
    projects.forEach(project => {
      const row = [
        project.appName || '',
        (project.platforms || []).join(';'),
        (project.aiAgents || []).join(';'),
        (project.aiTools || []).join(';'),
        (project.cloudServices || []).join(';'),
        (project.userNames || []).join(';'),
        project.initialRequestDate || '',
        project.currentRequestDate || '',
        project.lastGoodRestorePoint || '',
        project.currentRestorePoint || '',
        `"${(project.initialRequestNotes?.content || '').replace(/"/g, '""')}"`,
        `"${(project.currentRequestNotes?.content || '').replace(/"/g, '""')}"`,
        `"${(project.whatWasDone?.content || '').replace(/"/g, '""')}"`,
        `"${(project.whatNeedsFixed?.content || '').replace(/"/g, '""')}"`,
        project.previewUrl || '',
        project.publishedUrl || '',
        project.deployedDate || '',
        project.deployedFrom || '',
        project.publishedFrom || '',
        ...customFields.map(field => {
          let value = project[field.name];
          
          // Handle different field types for CSV export
          if (field.type === 'checkboxes' && Array.isArray(value)) {
            return `"${value.join(';')}"`;
          } else if (field.type === 'notes' && value) {
            return `"${value.replace(/"/g, '""')}"`;
          } else if (field.type === 'boolean') {
            return value ? 'Yes' : 'No';
          } else {
            return value ? `"${String(value).replace(/"/g, '""')}"` : '';
          }
        })
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `app_dev_journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          
          const projects = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const project: any = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              order: 0,
              isFavorite: false,
              initialRequestNotes: { content: '', lastUpdated: '', isChecked: false },
              currentRequestNotes: { content: '', lastUpdated: '', isChecked: false },
              whatWasDone: { content: '', lastUpdated: '', isChecked: false },
              whatNeedsFixed: { content: '', lastUpdated: '', isChecked: false }
            };

            headers.forEach((header, index) => {
              const value = values[index]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '';
              
              switch (header.trim()) {
                case 'App Name':
                  project.appName = value;
                  break;
                case 'Platforms':
                  project.platforms = value ? value.split(';') : [];
                  break;
                case 'AI Agents':
                  project.aiAgents = value ? value.split(';') : [];
                  break;
                case 'AI Tools':
                  project.aiTools = value ? value.split(';') : [];
                  break;
                case 'Cloud Services':
                  project.cloudServices = value ? value.split(';') : [];
                  break;
                case 'User Names':
                case 'Google Account':
                  project.userNames = value ? value.split(';') : [];
                  break;
                case 'Initial Request Date':
                  project.initialRequestDate = value;
                  break;
                case 'Current Request Date':
                case 'Last Request Date':
                  project.currentRequestDate = value;
                  break;
                case 'Last Good Restore Point':
                  project.lastGoodRestorePoint = value;
                  break;
                case 'Current Restore Point':
                  project.currentRestorePoint = value;
                  break;
                case 'Initial Request Notes':
                  project.initialRequestNotes.content = value;
                  project.initialRequestNotes.lastUpdated = new Date().toLocaleString();
                  break;
                case 'Current Request Notes':
                  project.currentRequestNotes.content = value;
                  project.currentRequestNotes.lastUpdated = new Date().toLocaleString();
                  break;
                case 'What Was Done':
                  project.whatWasDone.content = value;
                  project.whatWasDone.lastUpdated = new Date().toLocaleString();
                  break;
                case 'What Needs Fixed':
                  project.whatNeedsFixed.content = value;
                  project.whatNeedsFixed.lastUpdated = new Date().toLocaleString();
                  break;
                case 'Preview URL':
                  project.previewUrl = value;
                  break;
                case 'Published URL':
                  project.publishedUrl = value;
                  break;
                case 'Deployed Date':
                  project.deployedDate = value;
                  break;
                case 'Deployed From':
                  project.deployedFrom = value;
                  break;
                case 'Published From':
                  project.publishedFrom = value;
                  break;
                default:
                  // Handle custom fields
                  if (customFields.some(field => field.name === header.trim())) {
                    const field = customFields.find(f => f.name === header.trim());
                    if (field?.type === 'checkboxes') {
                      project[header.trim()] = value ? value.split(';') : [];
                    } else if (field?.type === 'boolean') {
                      project[header.trim()] = value.toLowerCase() === 'yes' || value === 'true';
                    } else {
                      project[header.trim()] = value;
                    }
                  }
              }
            });

            return project;
          });

          if (confirm('Do you want to append these records to your existing data? Click Cancel to replace all existing data.')) {
            window.dispatchEvent(new Event('journal-before-data-operation'));
            // Append mode
            const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
            const updatedProjects = [...existingProjects, ...projects];
            localStorage.setItem('projects', JSON.stringify(updatedProjects));
          } else {
            // Replace mode
            localStorage.setItem('projects', JSON.stringify(projects));
          }
          
          window.location.reload();
        } catch (error) {
          alert('Error importing CSV. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Get field type icon
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <span className="text-blue-400">Aa</span>;
      case 'number':
        return <span className="text-green-400">123</span>;
      case 'date':
        return <span className="text-purple-400">📅</span>;
      case 'boolean':
        return <span className="text-yellow-400">✓/✗</span>;
      case 'notes':
        return <AlignLeft size={16} className="text-orange-400" />;
      case 'dropdown':
        return <List size={16} className="text-indigo-400" />;
      case 'checkboxes':
        return <CheckSquare size={16} className="text-pink-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Database</h2>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
            <Database size={16} className="text-blue-400" />
            <span className="text-sm">Records: {recordCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('changePin')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            title="Change Security PIN"
          >
            <Key size={20} />
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {!hideCustomFields && (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <button
            onClick={() => setShowAddField(true)}
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 flex items-center gap-2"
          >
            <Plus size={16} /> Add Field
          </button>
        </div>

        {showAddField && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Field Name</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Enter field name"
                    className="w-full bg-gray-600 rounded p-2"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-sm font-medium mb-1">Field Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full bg-gray-600 rounded p-2"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Yes/No</option>
                    <option value="notes">Notes (textarea)</option>
                    <option value="dropdown">Dropdown (select)</option>
                    <option value="checkboxes">Checkboxes (multi-select)</option>
                  </select>
                </div>
              </div>
              
              {(newFieldType === 'dropdown' || newFieldType === 'checkboxes') && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full bg-gray-600 rounded p-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter options separated by commas (e.g., "Open, In Progress, Done")
                  </p>
                </div>
              )}
              
              {fieldError && (
                <div className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {fieldError}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAddCustomField}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 flex items-center gap-2"
                >
                  <Save size={16} /> Save Field
                </button>
                <button
                  onClick={() => {
                    setShowAddField(false);
                    setNewFieldName('');
                    setNewFieldType('text');
                    setNewFieldOptions('');
                    setFieldError(null);
                  }}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {customFields.length > 0 ? (
          <div className="space-y-2">
            {customFields.map(field => (
              <div
                key={field.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                {editingField === field.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Field Name</label>
                        <input
                          type="text"
                          value={editFieldName}
                          onChange={(e) => setEditFieldName(e.target.value)}
                          className="w-full bg-gray-600 rounded p-2"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        {getFieldTypeIcon(field.type)}
                        <span className="text-sm text-gray-400">({field.type})</span>
                      </div>
                    </div>
                    
                    {(field.type === 'dropdown' || field.type === 'checkboxes') && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editFieldOptions}
                          onChange={(e) => setEditFieldOptions(e.target.value)}
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full bg-gray-600 rounded p-2"
                        />
                      </div>
                    )}
                    
                    {fieldError && (
                      <div className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {fieldError}
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveFieldEdit(field.id)}
                        className="bg-green-600 px-3 py-1 rounded hover:bg-green-500 flex items-center gap-1 text-sm"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setEditFieldName('');
                          setEditFieldOptions('');
                          setFieldError(null);
                        }}
                        className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {getFieldTypeIcon(field.type)}
                      <span className="font-medium">{field.name}</span>
                      <span className="text-sm text-gray-400">({field.type})</span>
                      {field.options && (
                        <span className="text-xs text-gray-500 ml-2">
                          Options: {field.options.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditField(field.id)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Edit field"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Remove field"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            No custom fields yet. Click "Add Field" to create one.
          </p>
        )}
      </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => handleAction('backup')}
          className="flex items-center justify-center gap-2 bg-blue-600 p-4 rounded-lg hover:bg-blue-500"
        >
          <Download size={20} />
          <span>Backup Database</span>
        </button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
          <button
            onClick={() => handleAction('restore')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 p-4 rounded-lg hover:bg-green-500"
          >
            <Upload size={20} />
            <span>Restore Database</span>
          </button>
        </div>

        <button
          onClick={() => handleAction('export')}
          className="flex items-center justify-center gap-2 bg-purple-600 p-4 rounded-lg hover:bg-purple-500"
        >
          <Download size={20} />
          <span>Export to CSV</span>
        </button>

        <div>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={() => handleAction('import')}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 p-4 rounded-lg hover:bg-indigo-500"
          >
            <Upload size={20} />
            <span>Import from CSV</span>
          </button>
        </div>

        <button
          onClick={() => handleAction('clear')}
          className="flex items-center justify-center gap-2 bg-red-600 p-4 rounded-lg hover:bg-red-500 sm:col-span-2 lg:col-span-1"
        >
          <Trash2 size={20} />
          <span>Clear Database</span>
        </button>
      </div>

      {showPinInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={20} />
              <h3 className="text-lg font-semibold">Enter Security PIN</h3>
            </div>
            <p className="text-gray-400 mb-4">
              This action requires PIN verification for security.
              {action === 'clear' && (
                <span className="text-red-400 block mt-2">
                  Warning: This will permanently delete all your data!
                </span>
              )}
            </p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-gray-700 rounded p-2 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={verifyPin}
                className="flex-1 bg-blue-600 p-2 rounded hover:bg-blue-500"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowPinInput(false);
                  setPin('');
                }}
                className="flex-1 bg-gray-600 p-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Key size={20} />
              <h3 className="text-lg font-semibold">Change Security PIN</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current PIN</label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN"
                  className="w-full bg-gray-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN"
                  className="w-full bg-gray-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm new PIN"
                  className="w-full bg-gray-700 rounded p-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleChangePin}
                className="flex-1 bg-blue-600 p-2 rounded hover:bg-blue-500"
              >
                Change PIN
              </button>
              <button
                onClick={() => {
                  setShowChangePinModal(false);
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
                className="flex-1 bg-gray-600 p-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <Help
          title="Database Management Help"
          sections={[
            {
              title: "Custom Fields",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Managing Custom Fields</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Add custom fields to track additional information in your records</li>
                      <li>Fields are automatically added to all existing and new records</li>
                      <li>Choose from different field types:
                        <ul className="list-circle list-inside ml-6 mt-1 space-y-1">
                          <li>Text: Single line text input</li>
                          <li>Number: Numeric values only</li>
                          <li>Date: Date picker</li>
                          <li>Yes/No: Boolean checkbox</li>
                          <li>Notes: Multi-line text area for longer content</li>
                          <li>Dropdown: Single selection from predefined options</li>
                          <li>Checkboxes: Multiple selections from predefined options</li>
                        </ul>
                      </li>
                      <li>Edit field names and options at any time</li>
                      <li>Custom fields are included in CSV exports</li>
                      <li>Fields can be removed at any time (this will remove the data from all records)</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Security",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">PIN Protection</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>All database operations require PIN verification</li>
                      <li>Default PIN is "1234" if not changed</li>
                      <li>Change your PIN regularly for better security</li>
                      <li>Keep your PIN secure and don't share it</li>
                      <li>PIN must be at least 4 digits long</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Data Management",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Available Operations</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Backup: Save all your data to a file</li>
                      <li>Restore: Load data from a backup file</li>
                      <li>Export CSV: Create spreadsheet-compatible export</li>
                      <li>Import CSV: Load data from CSV format</li>
                      <li>Clear: Remove all data (requires confirmation)</li>
                    </ul>
                  </div>
                </div>
              )
            }
          ]}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}