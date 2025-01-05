import React from 'react';
import { X } from 'lucide-react';
import { Tab, Note } from '../types';

interface TabBarProps {
  tabs: Tab[];
  notes: Note[];
  onTabClose: (tabId: string) => void;
  onTabSelect: (noteId: string) => void;
}

export function TabBar({ tabs, notes, onTabClose, onTabSelect }: TabBarProps) {
  return (
    <div className="flex bg-gray-100 border-b border-gray-200 overflow-x-auto">
      {tabs.map(tab => {
        const note = notes.find(n => n.id === tab.id);
        return (
          <div
            key={tab.id}
            className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-200 min-w-[120px] max-w-[200px] cursor-pointer ${
              tab.isActive ? 'bg-white' : 'hover:bg-gray-50'
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="text-sm truncate flex-1">{note?.title || 'Untitled'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="hover:bg-gray-200 rounded-full p-1"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}