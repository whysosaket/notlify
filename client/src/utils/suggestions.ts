export function findSuggestion(text: string, suggestions: string): string {
  return suggestions;
  const words = text.split(' ');
  const lastWord = words[words.length - 1].toLowerCase();
  
  if (!lastWord) return '';
}