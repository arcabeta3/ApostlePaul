
export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // Base64 image data
  isInitial?: boolean;
}

export interface GameState {
  health: number; // Represents physical condition
  spirit: number; // Represents spiritual resolve
  inventory: string[];
  location: string;
  currentTask: string; // New: Explicit objective for the user
  isGameOver: boolean;
}

// Structured response expected from Gemini to parse state updates invisibly
export interface GameResponse {
  narrative: string; // The Zork-style text
  visualPrompt: string; // Description for the image generator
  stateUpdate: Partial<GameState>; // Updates to state
  imageData?: string; // Internal use to pass image back to UI
}