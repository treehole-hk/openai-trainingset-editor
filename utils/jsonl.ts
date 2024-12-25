import { v4 as uuidv4 } from 'uuid';

export function parseJSONL(jsonl: string): { data: any[], errors: string[] } {
  const lines = jsonl.trim().split('\n');
  const data: any[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      parsed.messages = parsed.messages.map((msg: any) => ({
        ...msg,
        id: uuidv4()
      }));
      data.push(parsed);
    } catch (error) {
      errors.push(`Error parsing line ${index + 1}: ${error}`);
    }
  });

  return { data, errors };
}

export function stringifyJSONL(data: any[]): string {
  return data.map(item => {
    const cleanItem = {...item};
    cleanItem.messages = cleanItem.messages.map((msg: any) => {
      const { id, ...cleanMsg } = msg;
      return cleanMsg;
    });
    return JSON.stringify(cleanItem);
  }).join('\n');
}

export function extractSubject(item: any): string {
  const systemMessage = item.messages.find((msg: any) => msg.role === 'system');
  if (systemMessage) {
    const words = systemMessage.content.split(' ');
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
  }
  return 'No system prompt';
}

