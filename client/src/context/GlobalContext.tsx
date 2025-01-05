/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode, useRef } from 'react';
import { Note } from '../types';

export const GlobalContext = createContext<any>(null);

// Context provider component
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notes, setNotes] = React.useState<Note[]>([]);
    const [noteUpdated, setNoteUpdated] = React.useState<boolean>(false);
    const keystrokes = useRef<number>(0);
    const lock = useRef<boolean>(false);

    const prevText = useRef<string>("");
    const autoCompleteSignal = useRef<number>(0);
    const autoCompleteController = useRef<AbortController | null>(null);

    const suggestedText = useRef<string>("");

    return (
        <GlobalContext.Provider value={{ notes, setNotes, noteUpdated, setNoteUpdated, keystrokes, lock, prevText, autoCompleteSignal, autoCompleteController, suggestedText }}>
            {children}
        </GlobalContext.Provider>
    );
};