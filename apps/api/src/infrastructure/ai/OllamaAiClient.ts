import { AiClient } from './AiClient.js';
import { logger } from '../../utils/logger.js';

interface OllamaChatMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: { content: string };
  done: boolean;
}

interface OllamaEmbedResponse {
  embedding: number[];
}

export class OllamaAiClient extends AiClient {
  private baseUrl: string;
  private chatModel: string;
  private embedModel: string;

  constructor(
    baseUrl: string = 'http://localhost:11434',
    chatModel: string = 'llama3.2',
    embedModel: string = 'nomic-embed-text',
  ) {
    super();
    this.baseUrl = baseUrl;
    this.chatModel = chatModel;
    this.embedModel = embedModel;
  }

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    const ollamaMessages: OllamaChatMessage[] = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.chatModel,
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama chat failed: ${body}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message?.content ?? '';
  }

  async chatStream(
    messages: { role: string; content: string }[],
    onToken: (token: string) => void,
  ): Promise<string> {
    const ollamaMessages: OllamaChatMessage[] = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.chatModel,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama chat stream failed: ${body}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Ollama returned no response body');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as OllamaChatResponse;
          if (chunk.message?.content) {
            fullContent += chunk.message.content;
            onToken(chunk.message.content);
          }
        } catch {
          logger.warn({ line }, 'Failed to parse Ollama streaming chunk');
        }
      }
    }

    return fullContent;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.embedModel,
        prompt: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama embedding failed: ${body}`);
    }

    const data = (await response.json()) as OllamaEmbedResponse;
    return data.embedding ?? [];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
