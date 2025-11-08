/**
 * Simple markdown renderer for teacher response text
 * Handles bold (**text**), italic (*text*), and code (`code`)
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'code';
  content: string;
}

/**
 * Parse markdown text into an array of nodes
 */
export const parseMarkdown = (text: string): MarkdownNode[] => {
  const nodes: MarkdownNode[] = [];
  let remaining = text;
  
  // Regex patterns for markdown syntax
  const patterns = [
    { type: 'bold' as const, regex: /\*\*([^*]+)\*\*/g },
    { type: 'italic' as const, regex: /\*([^*]+)\*/g },
    { type: 'code' as const, regex: /`([^`]+)`/g },
  ];
  
  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; type: 'bold' | 'italic' | 'code'; content: string } | null = null;
    
    // Find the earliest match among all patterns
    for (const pattern of patterns) {
      const match = pattern.regex.exec(remaining);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = {
          index: match.index,
          length: match[0].length,
          type: pattern.type,
          content: match[1]
        };
      }
      // Reset regex lastIndex for next iteration
      pattern.regex.lastIndex = 0;
    }
    
    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        nodes.push({
          type: 'text',
          content: remaining.substring(0, earliestMatch.index)
        });
      }
      
      // Add the formatted node
      nodes.push({
        type: earliestMatch.type,
        content: earliestMatch.content
      });
      
      // Continue with remaining text
      remaining = remaining.substring(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add remaining text
      if (remaining.length > 0) {
        nodes.push({
          type: 'text',
          content: remaining
        });
      }
      break;
    }
  }
  
  return nodes;
};

/**
 * Render markdown nodes to React elements
 */
export const renderMarkdown = (text: string): React.ReactNode => {
  const nodes = parseMarkdown(text);
  
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'bold':
        return <strong key={index}>{node.content}</strong>;
      case 'italic':
        return <em key={index}>{node.content}</em>;
      case 'code':
        return <code key={index} style={{ 
          backgroundColor: '#f3f4f6',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }}>{node.content}</code>;
      case 'text':
      default:
        return <span key={index}>{node.content}</span>;
    }
  });
};
