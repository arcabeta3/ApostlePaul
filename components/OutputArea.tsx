import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface OutputAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const OutputArea: React.FC<OutputAreaProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 font-serif text-lg leading-relaxed text-dungeon-300 bg-dungeon-950"
      ref={scrollRef}
    >
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`
            ${msg.role === 'user' 
              ? 'text-dungeon-600 font-mono text-base border-l-2 border-dungeon-700 pl-4 py-1 italic mb-6' 
              : 'animate-fade-in'
            }
          `}
        >
          {msg.role === 'user' ? (
            <div className="flex items-center space-x-2">
                <span className="opacity-50 text-xs uppercase tracking-widest text-dungeon-600">Action:</span>
                <span>{msg.content}</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
               {/* Image Display - Dungeon Style */}
              {msg.image && (
                <div className="w-full my-4 border-4 border-dungeon-800 bg-black shadow-2xl relative group">
                    <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none z-10"></div>
                    <img 
                        src={msg.image} 
                        alt="Scene illustration" 
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 sepia-[0.3]"
                    />
                </div>
              )}
              
              {/* Text Display */}
              <div className="whitespace-pre-line text-dungeon-300 text-lg md:text-xl font-light tracking-wide leading-8 drop-shadow-md">
                {msg.content}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex flex-col items-center space-y-4 mt-8 opacity-50">
          <div className="w-2 h-2 bg-dungeon-600 rounded-full animate-ping"></div>
          <span className="text-dungeon-600 font-serif italic text-sm">正在聆聽...</span>
        </div>
      )}
      
      <div className="h-12" />
    </div>
  );
};

export default OutputArea;