export interface AttachedFile {
  name: string;
  type: string;
  base64: string;
  size?: string;
  url?: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface PromptOutput {
  subject?: string;
  style?: string;
  lighting?: string;
  camera?: string;
  mood?: string;
  quality?: string;
  negative?: string;
  rawPrompt?: string;
}

export interface VideoPromptOutput {
  scenes: {
    sceneNum: number;
    cameraMovement: string;
    action: string;
    environment: string;
    lighting: string;
    audio: string;
    duration: string;
    transition: string;
    prompt: string;
  }[];
  rawOutput?: string;
}

export interface ConversionOutput {
  originalName: string;
  convertedName: string;
  outputFormat: string;
  downloadUrl: string;
  fileSize: string;
  durationMs: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentUsed?: string;
  createdAt: string;
  file?: AttachedFile;
  sources?: SearchSource[];
  promptDetails?: PromptOutput;
  videoDetails?: VideoPromptOutput;
  conversionDetails?: ConversionOutput;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  provider: string;
  role: string;
  bestFor: string;
  status: "online" | "offline" | "busy";
  speed: "Ultra Fast" | "Fast" | "Balanced" | "High Reasoning";
  costLevel: "Free" | "Low" | "Medium" | "High";
  icon: string;
  description: string;
}

export interface Memory {
  id: string;
  content: string;
  type: "chat" | "project" | "file" | "user_preference";
  createdAt: string;
}

export interface UsageLog {
  id: string;
  agentName: string;
  taskType: string;
  tokensUsed: number;
  cost?: number;
  createdAt: string;
  description: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: string;
  description: string;
}

export type TaskType =
  | "general_chat"
  | "coding"
  | "debugging"
  | "research"
  | "latest_news"
  | "image_prompt"
  | "video_prompt"
  | "file_conversion"
  | "document_summary"
  | "voice_command"
  | "memory_search"
  | "database_task"
  | "ui_design"
  | "math_reasoning"
  | "business_plan"
  | "translation";
