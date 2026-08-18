// taskInput.ts
export interface ParsedTaskInput {
  title: string;
  tags: string[];
  priority: number;
}

export function toCamelTag(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9_-]/g, '');
}

export function parseTaskInput(input: string, defaultPriority: number): ParsedTaskInput {
  const tags: string[] = [];
  let priority = defaultPriority;
  const priorityMatch = input.match(/!([1-4])/);

  if (priorityMatch) {
    priority = parseInt(priorityMatch[1]);
    input = input.replace(priorityMatch[0], '');
  }

  const title = input
    .replace(/#([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)*)/g, (matchedText, rawTag: string) => {
      const tagName = toCamelTag(rawTag);
      if (tagName) tags.push(tagName);
      return '';
    })
    .trim();

  return { title, tags, priority };
}
