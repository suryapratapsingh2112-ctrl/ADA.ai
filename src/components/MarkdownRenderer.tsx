import { useMemo, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 rounded-lg overflow-hidden bg-[#1e1e1e] border border-border/30">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border/20">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content with syntax highlighting */}
      <Highlight theme={themes.vsDark} code={code.trim()} language={language || 'text'}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre 
            className={`${className} p-4 overflow-x-auto text-sm`} 
            style={{ ...style, background: 'transparent', margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell pr-4 text-right select-none text-muted-foreground/40 text-xs">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const renderedParts = useMemo(() => {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    
    // Split content by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        content: match[2],
        language: match[1] || 'text',
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts;
  }, [content]);

  const renderTextContent = (text: string) => {
    let html = text;

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-secondary text-primary text-sm font-mono">$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-foreground mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-4">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-semibold"><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

    // Citations - make them clickable superscripts
    html = html.replace(/\[(\d+)\]/g, '<sup class="text-primary cursor-pointer hover:underline font-medium">[$1]</sup>');

    // Lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 mb-1 list-disc">$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-foreground/90 leading-relaxed">');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return `<p class="mb-4 text-foreground/90 leading-relaxed">${html}</p>`;
  };

  return (
    <div className="prose prose-invert max-w-none">
      <div className={isStreaming ? 'typing-cursor' : ''}>
        {renderedParts.map((part, index) => (
          part.type === 'code' ? (
            <CodeBlock key={index} code={part.content} language={part.language || 'text'} />
          ) : (
            <div 
              key={index}
              dangerouslySetInnerHTML={{ __html: renderTextContent(part.content) }}
            />
          )
        ))}
      </div>
    </div>
  );
}
