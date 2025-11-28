import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (!disabled && inputRef.current) {
        inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-dungeon-900 border-t border-dungeon-800 relative z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
      <div className="max-w-3xl mx-auto relative group">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-dungeon-600 font-mono text-xl mr-2 group-focus-within:text-dungeon-accent transition-colors">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "..." : "在此輸入行動..."}
          className="w-full bg-transparent pl-8 text-dungeon-200 font-mono text-lg placeholder-dungeon-700 focus:outline-none py-2 transition-colors border-b border-transparent focus:border-dungeon-700"
          autoComplete="off"
          autoFocus
        />
      </div>
    </form>
  );
};

export default InputArea;