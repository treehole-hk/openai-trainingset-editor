import { v4 as uuidv4 } from 'uuid';

interface JSONLItem {
  messages: any[];
  preference?: 'chosen' | 'rejected' | null;
}

export function parseJSONL(content: string): { data: JSONLItem[], errors: string[] } {
  const lines = content.split('\n').filter(line => line.trim());
  const data: JSONLItem[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      if (!Array.isArray(parsed.messages)) {
        errors.push(`Line ${index + 1}: Invalid format - missing or invalid 'messages' array`);
      } else {
        parsed.messages = parsed.messages.map((msg: any) => ({
          ...msg,
          id: uuidv4()
        }));
        data.push(parsed);
      }
    } catch (error: any) {
      errors.push(`Line ${index + 1}: ${error.message}`);
    }
  });

  return { data, errors };
}

export function stringifyJSONL(data: JSONLItem[]): string {
  return data
    .map(item => {
      // Create a new object without null/undefined preference
      const cleanItem = { ...item };
      if (!cleanItem.preference) {
        delete cleanItem.preference;
      }
      cleanItem.messages = cleanItem.messages.map((msg: any) => {
        const { id, ...cleanMsg } = msg;
        return cleanMsg;
      });
      return JSON.stringify(cleanItem);
    })
    .join('\n');
}

export function extractSubject(item: any) {
  // Use the first non-system message as the title
  const firstMessage = item.messages.find((m: any) => m.role !== 'system');
  if (!firstMessage) return 'New Conversation';
  
  // Take first line, remove extra whitespace, and handle empty content
  const content = firstMessage.content.trim();
  if (!content) return `Empty ${firstMessage.role} message`;
  
  const firstLine = content.split('\n')[0].trim();
  // Truncate if longer than 40 characters to maintain clean sidebar
  return firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
}

