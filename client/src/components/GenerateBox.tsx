import { useEffect, useRef } from "react"
import { Note } from "../types";
import { useNotes } from "../hooks/useNotes";

interface GenerateBoxProps {
    note: Note;
    setThinking: (value: number) => void;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    setThinkingText: (value: string) => void;
}


const GenerateBox = ({ note, setThinking, isOpen, setIsOpen, setThinkingText }: GenerateBoxProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { generateNotes, updateNote } = useNotes();
    const notesLock = useRef<boolean>(false);
    const notesBackup = useRef<string>("");

    const handleGenerateNotes = async () => {
        if (!note) return;
        const value = inputRef.current?.value;
        notesBackup.current = note.content;
        if (notesLock.current) {
            return;
        }
        inputRef.current!.value = "Generating...";
        inputRef.current!.disabled = true;
        notesLock.current = true;
        setThinking(3);
        setThinkingText("generating notes...");
        const response = await generateNotes(value || "", note.content, note);
        setThinkingText("");
        setThinking(0);
        if (response) {
            inputRef.current!.value = "";
            note.content += response;
            updateNote(note.id, { content: note.content });
        }
        setIsOpen(false);
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        inputRef.current?.focus();

        const handleKeyPress = (event: KeyboardEvent) => {
            // Bind Command+G to trigger autoComplete immediately
            if (event.key === 'g' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setIsOpen(!isOpen);
            }

            if(notesLock.current&&(event.key === 'Backspace' || event.key === 'Delete')) {
                note.content = notesBackup.current;
                updateNote(note.id, { content: note.content });
                notesBackup.current = "";
                notesLock.current = false;
            }

            notesLock.current = false;

            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }

            if (event.key === 'Enter' && isOpen) {
                handleGenerateNotes();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                isOpen
            ) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className="absolute bottom-20 left-[calc(50%-15rem)] z-50"
        >
            {isOpen && (
                <input
                    ref={inputRef}
                    className="w-[50rem] animated-box bg-neutral-300/10 backdrop-blur-md border-r border-gray-200 flex flex-col h-10 px-8 py-7 shadow-xl rounded-[8rem] outline-none"
                    type="text"
                    placeholder="Generate Text...."
                />
            )}
        </div>
    );
};

export default GenerateBox