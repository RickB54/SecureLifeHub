// @ts-nocheck
import React, { useState } from 'react';
import { AppIdea } from '../types';
import { Plus, Save, Trash2, HelpCircle, Edit2, X, Tag, Calendar, Star } from 'lucide-react';
import SpeechToText from './SpeechToText';
import Help from './Help';
import DateField from './DateField';
import { formatDateTime } from '../dates';

interface AppIdeasProps {
  ideas: AppIdea[];
  onAddIdea: (content: string) => void;
  onUpdateIdea: (id: string, content: string) => void;
  onDeleteIdea: (id: string) => void;
}

export default function AppIdeas({ ideas, onAddIdea, onUpdateIdea, onDeleteIdea }: AppIdeasProps) {
  const [newIdea, setNewIdea] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      onAddIdea(newIdea.trim());
      setNewIdea('');
    }
  };

  const handleEditSubmit = (id: string) => {
    if (editedContent.trim()) {
      onUpdateIdea(id, editedContent.trim());
      setEditingIdea(null);
      setEditedContent('');
    }
  };

  const handleDelete = (id: string) => {
    if (showDeleteConfirm === id) {
      onDeleteIdea(id);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(id);
      setTimeout(() => setShowDeleteConfirm(null), 3000);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const ideaDate = new Date(parseInt(idea.id));
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return ideaDate >= start && ideaDate <= new Date(end.setHours(23, 59, 59, 999));
    } else if (start) {
      return ideaDate >= start;
    } else if (end) {
      return ideaDate <= new Date(end.setHours(23, 59, 59, 999));
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ideas</h2>
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Enter your idea..."
            className="w-full bg-gray-800 rounded-lg p-2 pr-12"
          />
          <div className="absolute right-2 top-1">
            <SpeechToText
              onTranscript={(text) => {
                setNewIdea(prev => prev ? `${prev} ${text}` : text);
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          <Calendar size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold">Date Filter</h3>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <DateField
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 rounded pl-10 p-2"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <DateField
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 rounded pl-10 p-2"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="p-4 rounded-lg bg-gray-800 border border-gray-700 space-y-2"
          >
            {editingIdea === idea.id ? (
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-gray-700 rounded p-2 pr-12 min-h-[100px]"
                  />
                  <div className="absolute right-2 top-2">
                    <SpeechToText
                      onTranscript={(text) => {
                        setEditedContent(prev => prev ? `${prev} ${text}` : text);
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditSubmit(idea.id)}
                    className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 flex items-center gap-1"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingIdea(null);
                      setEditedContent('');
                    }}
                    className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <p className="flex-1">{idea.content}</p>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingIdea(idea.id);
                        setEditedContent(idea.content);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                      title="Edit idea"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className={`p-1 ${
                        showDeleteConfirm === idea.id 
                          ? 'bg-red-600 text-white rounded' 
                          : 'text-red-400 hover:text-red-300'
                      }`}
                      title={showDeleteConfirm === idea.id ? 'Click again to confirm deletion' : 'Delete idea'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={14} />
                  {formatDateTime(new Date(parseInt(idea.id)))}
                </div>
              </>
            )}
          </div>
        ))}
        {filteredIdeas.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            {startDate || endDate 
              ? 'No ideas found in the selected date range.' 
              : 'No ideas yet. Add your first idea above!'}
          </p>
        )}
      </div>

      {showHelp && (
        <Help
          title="Ideas Help"
          sections={[
            {
              title: "Managing Ideas",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Adding Ideas</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Type your idea in the input field</li>
                      <li>Use the microphone icon for voice input</li>
                      <li>Click the plus button or press Enter to add the idea</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Editing Ideas</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Click the edit icon to modify an idea</li>
                      <li>Use voice input for quick edits</li>
                      <li>Save or cancel your changes</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Deleting Ideas</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Click the trash icon to delete an idea</li>
                      <li>Click again to confirm deletion</li>
                      <li>The confirmation prompt expires after 3 seconds</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Date Filtering",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Using Date Filters</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Set a start date to see ideas from that date forward</li>
                      <li>Set an end date to see ideas up to that date</li>
                      <li>Use both dates to see ideas within a specific range</li>
                      <li>Clear filters to see all ideas</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Best Practices",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Keep ideas concise but descriptive</li>
                      <li>Use voice input for quick capture of ideas</li>
                      <li>Review and clean up ideas periodically</li>
                      <li>Use date filters to find older ideas</li>
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