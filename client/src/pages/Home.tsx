import { useEffect } from 'react';
import { FileExplorer } from '../components/FileExplorer';
import { Editor } from '../components/Editor';
import { useNotes } from '../hooks/useNotes';
import { useTabs } from '../hooks/useTabs';
import { Note } from '../types';
import { useNavigate } from 'react-router-dom';

function App() {
  const { notes, createNote, updateNote, getNotes } = useNotes();
  const { tabs, openTab } = useTabs();

  const handleCreateNote = async () => {
    const newNote = await createNote();
    if (newNote) {
      openTab(newNote.id);
    }
  };

  const activeTab = tabs.find(tab => tab.isActive);
  const activeNote = activeTab ? notes.find((note: Note) => note.id === activeTab.id) : null;

  const navigate = useNavigate();

  useEffect(() => {
    // check if it has token
    const token = localStorage.getItem('token');
    if (token) {
      getNotes();
    }else {
      navigate('/login');
    }
  },[]);

  return (
    <>
    <div className="flex h-screen bg-white">
      <FileExplorer
        notes={notes}
        onNoteSelect={openTab}
        onCreateNote={handleCreateNote}
      />
      {activeNote ? (
        <Editor
          note={activeNote}
          onUpdate={(updates) => updateNote(activeNote.id, updates)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#f9f9f9]">
          <p>Select a note or create a new one to get started</p>
        </div>
      )}
    </div>
    </>
  );
}

export default App;