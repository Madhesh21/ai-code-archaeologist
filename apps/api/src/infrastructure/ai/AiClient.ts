export abstract class AiClient {
  abstract chat(messages: { role: string; content: string }[]): Promise<string>;
  abstract embed(text: string): Promise<number[]>;
}
