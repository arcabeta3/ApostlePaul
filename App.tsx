import React, { useState, useEffect } from 'react';
import OutputArea from './components/OutputArea';
import InputArea from './components/InputArea';
import StatusPanel from './components/StatusPanel';
import { initializeGame, sendCommand } from './services/geminiService';
import { Message, GameState } from './types';

// Updated Initial State for the Prisoner Persona
const INITIAL_STATE: GameState = {
  health: 80, 
  spirit: 30, // Start with low spirit (Fear)
  inventory: ['發霉的麵包'], 
  location: '馬梅爾定監獄',
  currentTask: '觀察那位奇怪的老人', 
  isGameOver: false,
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    const start = async () => {
      if (!process.env.API_KEY) {
        setIsApiKeyMissing(true);
        setIsLoading(false);
        return;
      }
      
      const response = await initializeGame();
      
      setMessages([{
        role: 'model',
        content: response.narrative,
        image: response.imageData,
        isInitial: true
      }]);
      
      if (response.stateUpdate) {
        setGameState(prev => ({ ...prev, ...response.stateUpdate }));
      }
      
      setIsLoading(false);
    };

    start();
  }, []);

  const handleSendMessage = async (text: string) => {
    // Optimistic UI update
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const response = await sendCommand(text);

    const modelMsg: Message = { 
        role: 'model', 
        content: response.narrative,
        image: response.imageData 
    };
    setMessages(prev => [...prev, modelMsg]);
    
    // Update game state
    if (response.stateUpdate) {
        setGameState(prev => ({
            ...prev,
            ...response.stateUpdate,
            // Ensure array merging is handled correctly if needed, or just replace
            inventory: response.stateUpdate.inventory || prev.inventory
        }));
    }

    setIsLoading(false);
  };

  if (isApiKeyMissing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dungeon-950 text-dungeon-300 p-8 text-center font-serif">
        <div className="border border-dungeon-700 p-8 bg-dungeon-900">
          <h1 className="text-xl font-display mb-4 text-flesh-red">CONFIGURATION ERROR</h1>
          <p>API Key Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-dungeon-950 flex flex-col md:flex-row overflow-hidden selection:bg-dungeon-300 selection:text-dungeon-950">
      
      {/* Mobile Top Bar: Title + Mission - Updated Colors */}
      <div className="md:hidden bg-dungeon-900 border-b border-dungeon-800 z-30 flex flex-col shadow-lg">
        <div className="p-3 text-center border-b border-dungeon-800">
           <h1 className="font-display text-dungeon-300 text-sm tracking-widest uppercase">保羅的最後見證</h1>
        </div>
        {/* Dedicated Mission Bar for Mobile */}
        <div className="px-4 py-2 bg-dungeon-950/50 flex justify-between items-center text-xs">
          <span className="text-dungeon-600 font-bold uppercase tracking-widest mr-2">當前任務:</span>
          <span className="text-spirit-gold font-serif font-medium truncate flex-1 text-right">
            {gameState.currentTask}
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        <OutputArea messages={messages} isLoading={isLoading} />
        
        <InputArea 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || gameState.isGameOver} 
        />
      </div>

      {/* Sidebar Status (Desktop Only mostly, but inventory visible on desktop) */}
      <StatusPanel state={gameState} />

    </div>
  );
};

export default App;