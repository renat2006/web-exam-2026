import React from 'react';

// Lightweight JS/TS syntax highlighter using regex tokenization
// No external dependencies — pure React + regex

interface CodeBlockProps {
  code: string;
  language?: string;
}

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'property' | 'tag' | 'attr' | 'punctuation' | 'type' | 'plain';
  value: string;
}

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'super',
  'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally',
  'throw', 'typeof', 'instanceof', 'in', 'of', 'yield', 'static', 'get', 'set',
  'constructor', 'interface', 'type', 'enum', 'implements', 'public', 'private',
  'protected', 'readonly', 'abstract', 'declare', 'module', 'namespace',
]);

const BUILTIN_VALUES = new Set([
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'console', 'window',
  'document', 'Promise', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Math',
  'Date', 'Error', 'TypeError', 'ReferenceError', 'Map', 'Set', 'JSON', 'void',
  'never', 'any', 'unknown', 'string', 'number', 'boolean', 'symbol', 'bigint',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const value = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }

    // Multi-line comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const value = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }

    // Strings (single/double/template)
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++; // skip escaped
        j++;
      }
      const value = code.slice(i, j + 1);
      tokens.push({ type: 'string', value });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_$]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9a-fA-FxXoObB._n]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // HTML tags (for HTML code snippets)
    if (code[i] === '<' && (code[i + 1] === '/' || /[a-zA-Z!]/.test(code[i + 1] || ''))) {
      // Check if this looks like an HTML tag
      const tagMatch = code.slice(i).match(/^<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^>]*)?\/?>/);
      if (tagMatch) {
        tokens.push({ type: 'tag', value: tagMatch[0] });
        i += tagMatch[0].length;
        continue;
      }
    }

    // Words (identifiers, keywords)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (JS_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (BUILTIN_VALUES.has(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (code[j] === '(') {
        tokens.push({ type: 'function', value: word });
      } else if (i > 0 && code[i - 1] === '.') {
        tokens.push({ type: 'property', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    // Operators
    if (/[=+\-*/<>!&|?:%^~]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[=+\-*/<>!&|?:%^~]/.test(code[j])) j++;
      tokens.push({ type: 'operator', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}()\[\];,.]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }

    // Whitespace and other
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<Token['type'], string> = {
  keyword: '#c792ea',     // purple
  string: '#c3e88d',      // green
  comment: '#546e7a',     // gray
  number: '#f78c6c',      // orange
  operator: '#89ddff',    // cyan
  function: '#82aaff',    // blue
  property: '#f07178',    // red-pink
  tag: '#f07178',         // red for HTML tags
  attr: '#ffcb6b',        // yellow
  punctuation: '#89ddff', // cyan
  type: '#ffcb6b',        // yellow for types/builtins
  plain: '#eeffff',       // white
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const tokens = tokenize(code.trim());
  const lines = code.trim().split('\n');
  const lineCount = lines.length;

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <div className="code-block-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="code-block-lang">JavaScript</span>
      </div>
      <div className="code-block-body">
        <div className="code-line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-block-pre">
          <code>
            {tokens.map((token, i) => (
              <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
                {token.value}
              </span>
            ))}
          </code>
        </pre>
      </div>

      <style>{`
        .code-block-wrapper {
          border-radius: 10px;
          overflow: hidden;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.06);
          font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        .code-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: rgba(0,0,0,0.25);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .code-block-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #ff5f57; }
        .dot-yellow { background: #febc2e; }
        .dot-green { background: #28c840; }

        .code-block-lang {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .code-block-body {
          display: flex;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .code-block-body::-webkit-scrollbar {
          height: 4px;
        }
        .code-block-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        .code-line-numbers {
          display: flex;
          flex-direction: column;
          padding: 14px 0;
          padding-left: 14px;
          padding-right: 12px;
          border-right: 1px solid rgba(255,255,255,0.04);
          user-select: none;
          flex-shrink: 0;
        }

        .code-line-numbers span {
          font-size: 11px;
          line-height: 1.65;
          color: rgba(255,255,255,0.15);
          text-align: right;
          min-width: 18px;
        }

        .code-block-pre {
          margin: 0;
          padding: 14px;
          font-size: 12.5px;
          line-height: 1.65;
          white-space: pre;
          flex: 1;
          min-width: 0;
        }

        .code-block-pre code {
          font-family: inherit;
        }

        @media (max-width: 600px) {
          .code-block-pre {
            font-size: 11px;
            padding: 10px;
            line-height: 1.6;
          }
          .code-line-numbers {
            padding: 10px 0 10px 10px;
            padding-right: 8px;
          }
          .code-line-numbers span {
            font-size: 10px;
            line-height: 1.6;
          }
          .code-block-header {
            padding: 6px 10px;
          }
          .dot {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
};
