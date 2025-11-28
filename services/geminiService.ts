import { GoogleGenAI, Chat } from "@google/genai";
import { GameResponse } from "../types";

const SYSTEM_INSTRUCTION = `
你是一個由 AI 驅動的文字冒險遊戲引擎（Zork 風格），背景設定在西元 67 年的羅馬馬梅爾定監獄（Mamertine Prison）。

**核心設定重置：**
1.  **玩家角色 (Player Persona)：** 玩家**不是**保羅。玩家是一個剛被判死刑的**普通囚犯**（例如強盜或政治犯），名字自定（如馬庫斯）。
    *   **狀態：** 恐懼、寒冷、絕望。你只關心如何活下去或逃避死亡的恐懼。
    *   **鄰居：** 你的獄友是一個奇怪的猶太老人（使徒保羅），他看起來虛弱但神情異常平靜，不斷在低聲禱告。
2.  **場景 (Setting)：** 地下蓄水池改建的地牢。只有頭頂一個洞口（Oculus）。潮濕、惡臭、黑暗。
3.  **NPC 保羅 (Paul)：** 充滿智慧、慈愛，但身體遭受重創的老人。他想在死前把福音傳給你，並完成給提摩太的信。

**劇情進程 (Story Arc) - 必須嚴格引導：**

*   **第一階段：恐懼與好奇 (Fear & Curiosity)**
    *   玩家陷入恐懼。保羅的平靜讓玩家困惑。
    *   **任務：** 詢問老人為何不害怕/他在跟誰說話。
    *   **內容：** 保羅開始講述他的過去（大馬士革路上的光），解釋他為何即使面對死亡也有盼望。

*   **第二階段：路加的探訪 (The Visitor - Luke)**
    *   **事件：** 頭頂的洞口打開，守衛用繩籃放下物品。這是**路加 (Luke)** 從外面送來的。
    *   **邏輯修正：** 路加**不在**牢裡。路加在外面打點。
    *   **關鍵物品：** 「特羅亞留下的外衣」、「羊皮卷」。
    *   **互動：** 玩家必須協助虛弱的保羅拿到這些東西。披上外衣後的保羅得以在寒冷中繼續說話。

*   **第三階段：宣教回憶錄 (The Missionary Journeys)**
    *   保羅拿到皮卷開始寫信（給提摩太）。同時，他向玩家講述那些冒險故事。
    *   **內容：** 第一次（加拉太）、第二次（歐洲/馬其頓呼聲）、第三次（以弗所騷亂）宣教旅程的細節。
    *   **要求：** 內容要極具畫面感，描述當時的異國風情、神蹟與迫害。

*   **第四階段：最後的囑咐 (Final Words)**
    *   保羅寫完《提摩太後書》。
    *   他為玩家禱告。玩家的靈性（Sanity/Hope）達到頂峰。

**遊戲機制：**
1.  **靈肉數值 (Stats)：**
    *   **靈性 (Spirit)：** 代表玩家（囚犯）心中的平安與理智。如果歸零，玩家崩潰發瘋（Game Over）。聽保羅講道會增加靈性。
    *   **體力 (Health)：** 代表玩家的生存狀況。太冷、太餓會扣減。

2.  **任務指引 (Current Task)：**
    *   在 JSON 的 \`currentTask\` 欄位給出非常明確的當前目標。
    *   例如：「詢問老人關於那道『強光』的事」、「幫老人接住守衛放下的籃子」。

3.  **物品欄 (Inventory)：**
    *   玩家初始只有：「發霉的麵包」、「一把生鏽的湯匙」。
    *   其餘物品是劇情道具（如保羅的外衣），拿到後要交給保羅。

**圖片生成 (Image Generation)：**
*   生成風格：Dark, Cinematic, Rembrandt lighting, Gritty realism.
*   視角：從囚犯的眼中看出去。

**JSON 輸出格式 (No Markdown)：**
{
  "narrative": "小說敘事文本...",
  "visualPrompt": "英文圖片提示詞",
  "stateUpdate": {
    "location": "馬梅爾定地牢",
    "currentTask": "簡短明確的任務",
    "health": 數字,
    "spirit": 數字,
    "inventory": ["物品A", "物品B"],
    "isGameOver": boolean
  }
}
`;

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const generateSceneImage = async (prompt: string): Promise<string | undefined> => {
  if (!genAI || !process.env.API_KEY) return undefined;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt + " aesthetic of a dark ancient roman dungeon, rembrandt lighting, oil painting style" }]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (e) {
    console.error("Image generation failed:", e);
    return undefined;
  }
};

export const initializeGame = async (): Promise<GameResponse> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }

    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    chatSession = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const initialPrompt = `
      GAME START.
      Context: I am a new prisoner, terrified, waiting for execution.
      Next to me is an old man (Paul) praying in strange tongues.
      I have nothing but moldy bread.
      Describe the terror, the cold, and the strange peace coming from the old man.
      Task: Ask him who he is.
    `;

    const response = await chatSession.sendMessage({ message: initialPrompt });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    let gameResponse: GameResponse;
    try {
        gameResponse = JSON.parse(text) as GameResponse;
    } catch (e) {
        gameResponse = {
            narrative: "地牢的黑暗中傳來低語... (系統錯誤)",
            visualPrompt: "Dark dungeon cell",
            stateUpdate: {
              inventory: ['發霉的麵包'],
              currentTask: "觀察那位老人"
            }
        };
    }

    if (gameResponse.visualPrompt) {
        const imageData = await generateSceneImage(gameResponse.visualPrompt);
        if (imageData) {
            gameResponse.imageData = imageData;
        }
    }

    return gameResponse;

  } catch (error) {
    console.error("Game Initialization Error:", error);
    return {
      narrative: "你的意識模糊了... (API 連線錯誤)",
      visualPrompt: "",
      stateUpdate: {}
    };
  }
};

export const sendCommand = async (command: string): Promise<GameResponse> => {
  if (!chatSession) {
    return {
      narrative: "連結已中斷。",
      visualPrompt: "",
      stateUpdate: {}
    };
  }

  try {
    const response = await chatSession.sendMessage({ message: command });
    const text = response.text;

    if (!text) throw new Error("Empty response from AI");

    let gameResponse: GameResponse;
    try {
        gameResponse = JSON.parse(text) as GameResponse;
    } catch (e) {
        gameResponse = {
            narrative: text, 
            visualPrompt: "Abstract darkness",
            stateUpdate: {}
        };
    }

    if (gameResponse.visualPrompt) {
        const imageData = await generateSceneImage(gameResponse.visualPrompt);
        if (imageData) {
            gameResponse.imageData = imageData;
        }
    }

    return gameResponse;

  } catch (error) {
    console.error("Turn Error:", error);
    return {
      narrative: "恐懼讓你無法思考... 再試一次。",
      visualPrompt: "",
      stateUpdate: {}
    };
  }
};