// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSharedOptions } from '../sharedOptions';
import { sanitizeSpelling } from '../backupData';
import { Plus, X, Edit2, Save, Trash2 } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  customValue?: string;
  onCustomChange?: (value: string) => void;
  accountOptions?: string[];
}

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  customValue,
  onCustomChange,
  accountOptions,
}: MultiSelectProps) {
  const shared = useSharedOptions();
  const [customDraft, setCustomDraft] = useState('');
  const draft = customValue ?? customDraft;
  // Selected entries are stored as "Item" or "Item, Account"
  const findEntry = (option: string) =>
    selected.find(item => item === option || item.startsWith(option + ', '));
  const isChecked = (option: string) => findEntry(option) !== undefined;
  const getAccount = (option: string) => {
    const entry = findEntry(option);
    return entry && entry !== option ? entry.slice(option.length + 2) : '';
  };
  const [customAccounts, setCustomAccounts] = useState<string[]>([]);
  const allAccounts = accountOptions
    ? (shared ? shared.options('Google Account', accountOptions) : [...new Set([...accountOptions, ...customAccounts])])
    : [];
  const handleAccountChange = (option: string, value: string) => {
    let account = value;
    if (value === '__custom__') {
      const typed = window.prompt('Enter a custom account name:')?.trim();
      if (!typed) return;
      account = sanitizeSpelling(typed);
      shared?.add('Google Account', account);
      if (!shared && !allAccounts.includes(account)) setCustomAccounts(prev => [...prev, account]);
    }
    const newEntry = account ? `${option}, ${account}` : option;
    const others = selected.filter(item => item !== option && !item.startsWith(option + ', '));
    onChange([...others, newEntry]);
  };

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editingOptions, setEditingOptions] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [localOptions, setLocalOptions] = useState(() => [...new Set([...options, ...selected.map(item => item.split(', ')[0])])]);

  const visibleOptions = shared ? shared.options(label, options) : localOptions;
  useEffect(() => { if (!shared) setLocalOptions([...new Set([...options, ...selected.map(item => item.split(', ')[0])])]); }, [options, selected, shared]);

  const handleCheckboxChange = (option: string) => {
    const newSelected = isChecked(option)
      ? selected.filter(item => item !== option && !item.startsWith(option + ', '))
      : [...selected, option];
    onChange(newSelected);
  };

  const handleCustomSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && draft.trim()) {
      e.preventDefault();
      const value = sanitizeSpelling(draft.trim());
      shared?.add(label, value);
      onCustomChange?.('');
      setCustomDraft('');
      onChange([...new Set([...selected, value])]);
      setShowCustomInput(false);
      // Add the new option to the local options
      setLocalOptions(prev => [...new Set([...prev, value])]);
    }
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOption.trim()) {
      const value = sanitizeSpelling(newOption.trim());
      shared?.add(label, value);
      setLocalOptions(prev => [...new Set([...prev, value])]);
      setNewOption('');
    }
  };

  const handleDeleteOption = (optionToDelete: string) => {
    if (shared) { shared.remove(label, optionToDelete); return; }
    setLocalOptions(prev => prev.filter(option => option !== optionToDelete));
    // Also remove from selected if it was selected
    if (isChecked(optionToDelete)) {
      onChange(selected.filter(item => item !== optionToDelete && !item.startsWith(optionToDelete + ', ')));
    }
  };

  // Split options into two rows
  const halfLength = Math.ceil(visibleOptions.length / 2);
  const firstRow = visibleOptions.slice(0, halfLength);
  const secondRow = visibleOptions.slice(halfLength);

  return (
    <div className="space-y-2 journal-field-section" data-section={label}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{label}</label>
        <Button
          onClick={() => setEditingOptions(!editingOptions)}
          className="text-blue-400 hover:text-blue-300 p-1"
          aria-label={`${editingOptions ? "Save" : "Edit"} ${label} options`}
          title={editingOptions ? "Save changes" : "Edit options"}
        >
          {editingOptions ? <Save size={16} /> : <Edit2 size={16} />}
        </Button>
      </div>
      
      <div className="space-y-2 bg-gray-800 p-3 rounded">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {firstRow.map(option => (
              <div key={option} className="flex items-center justify-between group">
                <label className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={isChecked(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="rounded bg-gray-700"
                  />
                  <span>{option}{getAccount(option) && <span className="text-blue-300">, {getAccount(option)}</span>}</span>
                </label>
                {accountOptions && (() => {
                  const acct = getAccount(option);
                  return (
                    <select
                      value={acct}
                      onChange={(e) => handleAccountChange(option, e.target.value)}
                      className="ml-2 bg-gray-700 border border-gray-600 rounded text-xs px-1 py-0.5 max-w-[7rem]"
                      aria-label={`${label} ${option} account`} title="Account"
                    >
                      <option value="">Account…</option>
                      {(acct && !allAccounts.includes(acct) ? [...allAccounts, acct] : allAccounts).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                      <option value="__custom__">Custom…</option>
                    </select>
                  );
                })()}
                {editingOptions && (
                  <Button
                    aria-label={`Delete ${label} option ${option}`}
                    title={`Delete ${option} from all records`}
                    onClick={() => handleDeleteOption(option)}
                    variant="ghost" size="icon" className="text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {secondRow.map(option => (
              <div key={option} className="flex items-center justify-between group">
                <label className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={isChecked(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="rounded bg-gray-700"
                  />
                  <span>{option}{getAccount(option) && <span className="text-blue-300">, {getAccount(option)}</span>}</span>
                </label>
                {accountOptions && (() => {
                  const acct = getAccount(option);
                  return (
                    <select
                      value={acct}
                      onChange={(e) => handleAccountChange(option, e.target.value)}
                      className="ml-2 bg-gray-700 border border-gray-600 rounded text-xs px-1 py-0.5 max-w-[7rem]"
                      aria-label={`${label} ${option} account`} title="Account"
                    >
                      <option value="">Account…</option>
                      {(acct && !allAccounts.includes(acct) ? [...allAccounts, acct] : allAccounts).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                      <option value="__custom__">Custom…</option>
                    </select>
                  );
                })()}
                {editingOptions && (
                  <Button
                    aria-label={`Delete ${label} option ${option}`}
                    title={`Delete ${option} from all records`}
                    onClick={() => handleDeleteOption(option)}
                    variant="ghost" size="icon" className="text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {editingOptions && (
          <form onSubmit={handleAddOption} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add new option..."
              className="flex-1 bg-gray-700 rounded p-2"
            />
            <Button
              type="submit"
              className="bg-blue-600 p-2 rounded hover:bg-blue-500"
              disabled={!newOption.trim()}
            >
              <Plus size={16} />
            </Button>
          </form>
        )}

        {!editingOptions && (
          <>
            {showCustomInput ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => { setCustomDraft(e.target.value); onCustomChange?.(e.target.value); }}
                  onKeyDown={handleCustomSubmit}
                  placeholder="Type and press Enter"
                  className="flex-1 bg-gray-700 rounded p-2"
                  autoFocus
                />
                <Button
                  onClick={() => setShowCustomInput(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-2"
              >
                <Plus size={16} /> Add Custom
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}