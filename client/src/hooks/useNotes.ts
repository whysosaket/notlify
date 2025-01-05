/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { Note } from '../types';
import { GlobalContext } from '../context/GlobalContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useNotes() {
  const {notes, setNotes, noteUpdated, setNoteUpdated, keystrokes, lock, prevText, suggestedText} = useContext(GlobalContext);
  const navigate = useNavigate();
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const getNotes = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setNotes(data.notes);
    }else{
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
      toast.error(data.error);
      console.error(data.error);
    }   
  };

  const searchNotes = async (query: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/search?q=${query}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setNotes(data.notes);
    }else{
      console.error(data.error);
    }   
  }

  const createNote = async () => {
    let newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: ''
    };
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newNote),
    });
    const data = await response.json();
    if (!data.success) {
      toast.error(data.error);
      console.error(data.error);
      return;
    }
    if (data.note) {
      newNote = data.note;
    }
    setNotes([newNote, ...notes]);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(notes.map((note: Note) => 
      note.id === id 
      ? { ...note, ...updates, lastModified: new Date() }
      : note
    ));
    if (keystrokes.current >= 20&&!lock.current) {
      await saveNote(id, updates);
    }
  };

  const saveNote = async (id: string, updates: Partial<Note>) => {
    if (keystrokes.current === 0) {
      return;
    }
    setNoteUpdated(true);
    lock.current = true;
    const content = updates.content;
    const title = updates.title;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/update/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({title, content}),
    });
    const data = await response.json();
    if (!data.success) {
      toast.error(data.error);
      console.error(data.error);
      return;
    }
    setNoteUpdated(false);
    lock.current = false;
    resetKeystrokes();
  }

  const deleteNote = async (id: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) {
      toast.error(data.error);
      console.error(data.error);
      return;
    }
  };

  const incrementKeystrokes = () => {
    keystrokes.current+=1;
  }

  const resetKeystrokes = () => {
    keystrokes.current = 0;
  }

  const autoComplete = async (content: string, note?: Note) => {
    const title = note?.title;
    const titleNeeded = title==='Untitled Note';
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/autocomplete`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ input: content, needTitle: titleNeeded }),
      });
  
      const data = await response.json();
  
      if (!data.success) {
        toast.error(data.error);
        console.error(data.error);
        return;
      }

      if (titleNeeded) {
        note!.title = data.title;
        updateNote(note!.id, { title: data.title });
      }

      return data.response;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error fetching autocomplete:', error);
      }
    }
  };

  const fixFactsAndErrors = async (content: string, note?: Note) => {
    const title = note?.title;
    const titleNeeded = title==='Untitled Note';
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/fix-facts-and-errors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({input: content, needTitle: titleNeeded}),
    });
    const data = await response.json();
    if (data.success) {
      if (titleNeeded) {
        note!.title = data.title;
        updateNote(note!.id, { title: data.title });
      }
      return data.response;
    }else{
      toast.error(data.error);
      console.error(data.error);
    }   
  }

  const generateNotes = async (prompt: string, content: string, note?: Note) => {
    const title = note?.title;
    const titleNeeded = title==='Untitled Note';
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/generate-notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, input: content, needTitle: titleNeeded }),
    });
    const data = await response.json();
    if (data.success) {
      if (titleNeeded) {
        note!.title = data.title;
        updateNote(note!.id, { title: data.title });
      }
      return data.response;
    }else{
      toast.error(data.error);
      console.error(data.error);
    }
  }

  return {
    notes,
    noteUpdated,
    createNote,
    updateNote,
    deleteNote,
    getNotes,
    incrementKeystrokes,
    saveNote,
    prevText,
    autoComplete,
    suggestedText,
    lock,
    setNoteUpdated,
    fixFactsAndErrors,
    generateNotes,
    searchNotes
  };
}