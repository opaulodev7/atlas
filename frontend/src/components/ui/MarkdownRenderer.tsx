import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body space-y-3 text-sm leading-relaxed text-slate-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-4 mb-2 pb-1 border-b border-slate-800 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-slate-100 tracking-tight mt-4 mb-2 flex items-center gap-2 text-brand-400">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-slate-100 mt-3 mb-1.5 flex items-center gap-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold text-slate-200 mt-2.5 mb-1 uppercase tracking-wider text-xs">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,

          // Cognitive Matrix badges & Bold text
          strong: ({ children }) => {
            const text = String(children);
            const upper = text.toUpperCase().trim();

            if (upper.includes('FATO') || upper.includes('[FATO]')) {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm mr-1">
                  {children}
                </span>
              );
            }
            if (upper.includes('INTERPRETAÇÃO') || upper.includes('[INTERPRETAÇÃO]')) {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm mr-1">
                  {children}
                </span>
              );
            }
            if (upper.includes('HIPÓTESE') || upper.includes('[HIPÓTESE]')) {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm mr-1">
                  {children}
                </span>
              );
            }
            if (upper.includes('RECOMENDAÇÃO') || upper.includes('[RECOMENDAÇÃO]')) {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm mr-1">
                  {children}
                </span>
              );
            }

            return <strong className="font-bold text-slate-100">{children}</strong>;
          },

          // Lists
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2.5 pl-5 list-disc list-outside text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2.5 pl-5 list-decimal list-outside text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed pl-1 marker:text-brand-400">{children}</li>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-500 bg-slate-950/60 pl-4 py-2 my-3 rounded-r-xl text-slate-300 italic text-xs leading-relaxed">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline code
          code: ({ node, className, children, ...props }) => {
            const isInline = !className && !String(children).includes('\n');
            if (isInline) {
              return (
                <code
                  className="bg-slate-950 px-1.5 py-0.5 rounded-md text-xs font-mono text-brand-300 border border-slate-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={String(children).replace(/\n$/, '')} />;
          },

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-950 text-slate-300 uppercase font-semibold border-b border-slate-800">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="px-3 py-2 border-r border-slate-800 last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-t border-slate-800/60 text-slate-300">{children}</td>,

          // Horizontal rule
          hr: () => <hr className="border-t border-slate-800 my-4" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Internal component for code blocks with copy button
const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Terminal className="w-3.5 h-3.5 text-brand-400" />
          Bloco de Código
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
