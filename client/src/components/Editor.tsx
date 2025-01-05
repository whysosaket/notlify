import { useEffect, useCallback, useRef, useState } from 'react';
import { Note } from '../types';
import { SuggestionInput } from './SuggestionInput';
import { useNotes } from '../hooks/useNotes';
import { FaRobot } from "react-icons/fa";
import { HiMiniWrenchScrewdriver } from "react-icons/hi2";
import GenerateBox from './GenerateBox';
import { GiFairyWand } from "react-icons/gi";
import { BsThreeDotsVertical } from "react-icons/bs";
import BreadCrumbMenu from './BreadCrumbMenu';


interface EditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

export function Editor({ note, onUpdate }: EditorProps) {
  const { deleteNote, getNotes, incrementKeystrokes, saveNote, autoComplete, suggestedText, noteUpdated, setNoteUpdated, fixFactsAndErrors  } = useNotes();

  const [titleWidth, setTitleWidth] = useState<number>(20);
  const [isBreadCrumbOpen, setIsBreadCrumbOpen] = useState<boolean>(false);

  const suggestedLock = useRef<boolean>(false);
  const fixedLock = useRef<boolean>(false);
  const fixedBackup = useRef<string>("");

  const [suggestion, setSuggestion] = useState('');
  const [thinkingText, setThinkingText] = useState<string>("");
  const [thinking, setThinking] = useState(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleAutoComplete = async () => {
    if(suggestedLock.current) {
      suggestedLock.current = false;
      return;
    }
    console.log('Auto-complete triggered');
    suggestedLock.current = true;
    setThinking(1);
    setThinkingText("auto-completing...");
    const value = await autoComplete(note.content, note);
    console.log(value);
    setThinkingText("");
    setThinking(0);
    suggestedText.current = value;
    if(suggestedLock.current) setSuggestion(value||"");
  };

  const handleFixFactsAndErrors = async () => {
    fixedBackup.current = note.content;
    if(fixedLock.current) {
      return;
    }
    fixedLock.current = true;
    setThinking(2);
    setThinkingText("fixing facts and errors...");
    const data = await fixFactsAndErrors(note.content, note);
    setThinkingText("");
    setThinking(0);
    setSuggestion("");
    suggestedText.current = "";
    note.content = data||"";
  }

  const handleIntervalUpdate = useCallback(() => {
    saveNote(note.id, { content: note.content, title: note.title });
  }, [note.id, note.content, saveNote, note.title]);

  const handleDelete = async () => {
    await deleteNote(note.id);
    await getNotes();
  };

  const handleSave = async () => {
    await saveNote(note.id, { content: note.content, title: note.title });
  }

  useEffect(() => {
    const value = (note.title.length/17)*20;
    const newWidth = Math.max(17, value);
    setTitleWidth(newWidth);
  }, [note.title]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      setNoteUpdated(true);
      incrementKeystrokes();

      if(suggestedLock.current&&(event.key != 'Tab')) {
        setSuggestion("");
        suggestedText.current = "";
      }else if(suggestedLock.current) {
        note.content += suggestion;
        setSuggestion("");
        suggestedText.current = "";
      }

      if(fixedLock.current&&(event.key === 'Backspace' || event.key === 'Delete')) {
        note.content = fixedBackup.current;
        onUpdate({ content: note.content });
        fixedBackup.current = "";
        fixedLock.current = false;
      }

      fixedLock.current = false;
      suggestedLock.current = false;
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleAutoComplete();
      }

      if (event.key === 'l' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleFixFactsAndErrors();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const interval = setInterval(handleIntervalUpdate, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(interval);
    };
  }, [handleIntervalUpdate, incrementKeystrokes, handleAutoComplete]);

  const handleToggleBreadCrumb = () => {
    setIsBreadCrumbOpen(!isBreadCrumbOpen);
  }

  return (
    <>
    <BreadCrumbMenu isBreadCrumbOpen={isBreadCrumbOpen} setIsBreadCrumbOpen={setIsBreadCrumbOpen} handleDelete={handleDelete} handleSave={handleSave} />
    <GenerateBox note={note} setThinking={setThinking} isOpen={isOpen} setIsOpen={setIsOpen} setThinkingText={setThinkingText} />
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex w-full justify-between border-b border-gray-200 pr-4">
        <div className='flex w-full'>
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="text-2xl font-semibold px-8 py-4 focus:outline-none"
          style={{ width: `${titleWidth}rem`, maxWidth: '60rem' }}
          placeholder="Note title"
        />
        <div className={`${noteUpdated?"bg-red-500":"bg-green-500"} font-bold my-auto w-2 h-2 rounded-full relative right-20 top-[2px]`}></div>
        </div>
        <button onClick={handleToggleBreadCrumb} className="my-auto">
          <BsThreeDotsVertical size={20} />
        </button>
      </div>
      <div className="flex-1 px-8 py-4">
        <SuggestionInput
          value={note.content}
          onChange={(content) => onUpdate({ content })}
          suggestedText={suggestion||""}
          thinkingText={thinkingText||""}
          placeholder="Start writing..."
        />
      </div>
      <div className='absolute bottom-4 right-4'>
      <button
          onClick={() => setIsOpen(true)}
          className={`text-neutral-800/50 hover:text-neutral-800 font-bold rounded my-auto mx-2 ${thinking===3?"animate-ping":""}`}
        >
          <GiFairyWand size={25} />
      </button>
      <button
          onClick={() => handleFixFactsAndErrors()}
          className={`text-neutral-800/50 hover:text-neutral-800 font-bold rounded my-auto mx-2 ${thinking===2?"animate-ping":""}`}
        >
          <HiMiniWrenchScrewdriver size={21} />
      </button>
      <button
          onClick={handleAutoComplete}
          className={`text-neutral-800/50 hover:text-neutral-800 font-bold rounded my-auto mx-2 ${thinking===1?"animate-ping":""}`}
        >
          <FaRobot size={25} />
      </button>
      </div>
    </div>
    </>
  );
}
