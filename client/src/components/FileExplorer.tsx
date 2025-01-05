import React, { useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Note } from '../types';
import { useNotes } from '../hooks/useNotes';
import { debounce } from 'lodash';

interface FileExplorerProps {
  notes: Note[];
  onNoteSelect: (noteId: string) => void;
  onCreateNote: () => void;
}

export function FileExplorer({ notes, onNoteSelect, onCreateNote }: FileExplorerProps) {
  const {prevText, searchNotes} = useNotes();
  const handleNoteSelect = (noteId: string) => {
    onNoteSelect(noteId);
    const note = notes.find(n => n.id === noteId);
    prevText.current = note?.content || '';
  }

  const handleSearch = useCallback(
    debounce((value: string) => {
      searchNotes(value);
    }, 500),
    []
  );
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value);
  };

  return (
    <div className="w-72 bg-[#f9f9f9] border-r border-gray-200 flex flex-col h-screen">
      <div className="py-4 px-6 border-b border-gray-200 ">
        <a href="/" className='flex justify-start items-center align-middle'>
          <img src="/notes.png" alt="Notelify Logo" className="w-8 h-8 mr-2" />
          <h1 className='font-varela font-semibold text-lg'>Notlify</h1>
        </a>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center space-x-2 bg-white rounded-md px-3 py-1.5 border border-gray-200 mx-4 mt-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            onChange={onChange}
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="p-4 space-y-1">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => handleNoteSelect(note.id)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <h3 className="font-medium text-sm truncate">{note.title}</h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {note.content || 'No additional text'}
              </p>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onCreateNote}
        className="m-4 flex items-center justify-center space-x-2 bg-neutral-800 text-white rounded-md py-2 hover:bg-neutral-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>New Note</span>
      </button>
    </div>
  );
}