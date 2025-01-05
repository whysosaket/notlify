import React, { useState, useRef, useEffect } from 'react';

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestedText?: string;
  thinkingText?: string;
}

const formatText = (text: string) => {
  return text.replace(/\n/g, '\n'); // This ensures \n is interpreted as line breaks.
};


export function SuggestionInput({ value, onChange, placeholder, suggestedText, thinkingText }: SuggestionInputProps) {
  const [suggestion, setSuggestion] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = value.slice(0, cursorPosition).split(/\s/);
    const currentWord = words[words.length - 1];
    const newSuggestion = currentWord ? suggestedText : '';
    setSuggestion(newSuggestion||"");
  }, [value, cursorPosition, suggestedText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      const beforeCursor = value.slice(0, cursorPosition);
      const afterCursor = value.slice(cursorPosition);
      const newValue = beforeCursor + suggestion + afterCursor;
      onChange(newValue);
      setCursorPosition(cursorPosition + suggestion.length);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      
      // Bind Command+K to trigger autoComplete immediately
      if (event.key === 'Tab') {
        event.preventDefault();
        textareaRef.current?.focus();
      }

    }
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  },[]);

  return (
    <div className="relative flex-1">
     <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        className="w-full resize-none bg-transparent text-gray-800 focus:outline-none leading-relaxed h-[calc(100vh-8rem)] pb-[34rem] relative z-10"
        placeholder={placeholder}
      />
      <div className="absolute inset-0 pointer-events-none leading-relaxed whitespace-pre-wrap">
        <span className="text-transparent leading-relaxed">{formatText(value)}</span>
        <span className="text-gray-400 leading-relaxed">{formatText(suggestedText||"")}</span>
        <span className="text-gray-400 italic">{formatText("  "+thinkingText||"")}</span>
      </div>
    </div>
    </div>
  );
}