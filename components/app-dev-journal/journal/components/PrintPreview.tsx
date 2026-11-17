// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Printer, X, Image, ImageOff } from 'lucide-react';
import { Project } from '../types';
import { formatDate } from '../dates';

interface PrintPreviewProps {
  project: Project;
  onClose: () => void;
  onPrint: () => void;
}

export default function PrintPreview({ project, onClose, onPrint }: PrintPreviewProps) {
  const [includeScreenshots, setIncludeScreenshots] = useState(true);
  const [customFields, setCustomFields] = useState<any[]>([]);

  useEffect(() => {
    // Load custom fields from localStorage
    const savedFields = localStorage.getItem('customFields');
    if (savedFields) {
      setCustomFields(JSON.parse(savedFields));
    }
  }, []);

  const handlePrint = () => {
    document.body.classList.toggle('hide-screenshots', !includeScreenshots);
    onPrint();
    setTimeout(() => {
      document.body.classList.remove('hide-screenshots');
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[9999]">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold">Print Preview</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIncludeScreenshots(!includeScreenshots)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded ${
              includeScreenshots ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={includeScreenshots ? 'Screenshots will be printed' : 'Screenshots will be hidden'}
          >
            {includeScreenshots ? (
              <>
                <Image size={18} /> Include Screenshots
              </>
            ) : (
              <>
                <ImageOff size={18} /> Hide Screenshots
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-500"
            >
              <Printer size={20} /> Print
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 p-2 rounded hover:bg-gray-600"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white text-black max-w-[8.5in] mx-auto p-8 shadow-xl print-content">
          <div className="page-break-after">
            <h1 className="text-3xl font-bold mb-8">{project.appName || 'Untitled Project'}</h1>

            <section className="page-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-600">Initial Request Date</h3>
                  <p>{formatDate(project.initialRequestDate) || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Last Request Date</h3>
                  <p>{formatDate(project.currentRequestDate) || 'Not specified'}</p>
                </div>
              </div>
            </section>

            <section className="page-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-600">Platforms</h3>
                  <p>{project.platforms.length > 0 ? project.platforms.join('; ') : 'None specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">AI Agents</h3>
                  <p>{project.aiAgents.length > 0 ? project.aiAgents.join('; ') : 'None specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">AI Tools</h3>
                  <p>{project.aiTools.length > 0 ? project.aiTools.join('; ') : 'None specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Cloud Services</h3>
                  <p>{project.cloudServices.length > 0 ? project.cloudServices.join(', ') : 'None specified'}</p>
                </div>
              </div>
            </section>

            <section className="page-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Users</h2>
              <div>
                  <h3 className="font-medium text-gray-600">Google Account</h3>
                <p>{project.userNames.length > 0 ? project.userNames.join(', ') : 'None specified'}</p>
              </div>
            </section>

            <section className="page-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Restore Points</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-600">Last Good Restore Point</h3>
                  <p>{project.lastGoodRestorePoint || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Current Restore Point</h3>
                  <p>{project.currentRestorePoint || 'Not specified'}</p>
                </div>
              </div>
            </section>

            <section className="page-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">URLs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-600">Project Dir</h3>
                  <p className="break-all">{project.previewUrl || 'Not specified'}</p>
                  <h3 className="font-medium text-gray-600 mt-2">Local Host</h3>
                  <p className="break-all">{project.localHost || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Published URL</h3>
                  <p className="break-all">{project.publishedUrl || 'Not specified'}</p>
                </div>
              </div>
            </section>

            {project.isDeployed && (
              <section className="page-section">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Deployment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-600">Deployed Date</h3>
                    <p>{formatDate(project.deployedDate) || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-600">Deployed From</h3>
                    <p>{project.deployedFrom || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-600">Published From</h3>
                    <p>{project.publishedFrom || 'Not specified'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Custom Fields Section */}
            {customFields.length > 0 && (
              <section className="page-section">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Custom Fields</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map(field => (
                    <div key={field.id}>
                      <h3 className="font-medium text-gray-600">{field.name}</h3>
                      <p>
                        {field.type === 'date' ? (formatDate(project[field.name]) || 'Not specified') : field.type === 'boolean' 
                          ? (project[field.name] ? 'Yes' : 'No') 
                          : (project[field.name] || 'Not specified')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <section className="page-section notes-section">
            <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Notes</h2>
            <div className="space-y-6">
              <div className="note-block">
                <h3 className="font-medium text-gray-600 mb-2">General Notes</h3>
                <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{project.initialRequestNotes.content || 'No notes'}</p>
              </div>
              <div className="note-block">
                <h3 className="font-medium text-gray-600 mb-2">Current Request Notes</h3>
                <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{project.currentRequestNotes.content || 'No notes'}</p>
              </div>
              <div className="note-block">
                <h3 className="font-medium text-gray-600 mb-2">What Was Done</h3>
                <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{project.whatWasDone.content || 'No notes'}</p>
              </div>
              <div className="note-block">
                <h3 className="font-medium text-gray-600 mb-2">What Needs Fixed</h3>
                <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{project.whatNeedsFixed.content || 'No notes'}</p>
              </div>
            </div>
          </section>

          {includeScreenshots && project.screenshots && project.screenshots.length > 0 && (
            <section className="page-section screenshots-section">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Screenshots</h2>
              <div className="grid grid-cols-1 gap-8">
                {project.screenshots.map((screenshot, index) => (
                  <div key={index} className="screenshot-block">
                    <img 
                      src={screenshot} 
                      alt={`Screenshot ${index + 1}`}
                      className="max-w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}