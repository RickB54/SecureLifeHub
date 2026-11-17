// @ts-nocheck
import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpSection {
  title: string;
  content: React.ReactNode;
}

interface HelpProps {
  sections: HelpSection[];
  title: string;
  onClose: () => void;
}

export default function Help({ sections, title, onClose }: HelpProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index}>
              <h4 className="text-xl font-semibold mb-3 text-blue-400">{section.title}</h4>
              <div className="space-y-4 text-gray-300">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 p-2 rounded hover:bg-blue-500"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
}