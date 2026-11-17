// @ts-nocheck
import React, { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import Help from './Help';
import { HelpCircle } from 'lucide-react';

interface FavoritesProps {
  projects: Project[];
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
  expandedCards: Set<string>;
  onToggleExpand: (id: string, expanded: boolean) => void;
  onExport: (id: string) => void;
  onAddTodo: (content: string, projectId: string, projectName: string, noteType: string) => void;
}

export default function Favorites({
  projects,
  onUpdate,
  onDelete,
  expandedCards,
  onToggleExpand,
  onExport,
  onAddTodo
}: FavoritesProps) {
  const [showHelp, setShowHelp] = useState(false);
  const favoriteProjects = projects.filter(project => project.isFavorite);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Favorite Records</h2>
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
      </div>
      
      {favoriteProjects.length === 0 ? (
        <p className="text-gray-400">No favorite records yet. Click the star icon on any record to add it here.</p>
      ) : (
        <div className="space-y-4">
          {favoriteProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onUpdate}
              onDelete={onDelete}
              color={`bg-gray-900`}
              isExpanded={expandedCards.has(project.id)}
              onToggleExpand={(expanded) => onToggleExpand(project.id, expanded)}
              onExport={() => onExport(project.id)}
              onAddTodo={onAddTodo}
            />
          ))}
        </div>
      )}

      {showHelp && (
        <Help
          title="Favorites Help"
          sections={[
            {
              title: "Managing Favorites",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Adding Favorites</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Click the star icon on any record to mark it as a favorite</li>
                      <li>Favorited records appear in this section for quick access</li>
                      <li>Click the star again to remove from favorites</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Working with Favorites",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Available Actions</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>All record features are available in favorites view</li>
                      <li>Changes made here sync with the main records view</li>
                      <li>Use the expand/collapse button to view full details</li>
                      <li>Export, print, or manage todos directly from favorites</li>
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
                      <li>Favorite frequently accessed records</li>
                      <li>Use favorites for active or important projects</li>
                      <li>Remove old projects from favorites when no longer needed</li>
                      <li>Regularly review and update favorite records</li>
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