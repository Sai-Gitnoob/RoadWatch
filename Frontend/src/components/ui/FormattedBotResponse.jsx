import React from 'react';
import { ChevronRight, Info, AlertTriangle, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

// ─── Inline Markdown Parser ─────────────────────────────────────────────────
// Converts **bold**, *italic*, `code`, [text](url), and bare URLs into React elements
function parseInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  // First pass: split on markdown links [text](url), bare URLs, and inline tokens
  const combinedRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s)\]]+)|(\*\*|__|\*|_|`)/g;

  const fragments = [];
  let lastIndex = 0;
  let match;
  const styleStack = [];

  while ((match = combinedRegex.exec(text)) !== null) {
    const index = match.index;

    // Push any plain text before this match
    if (index > lastIndex) {
      fragments.push({ type: 'text', text: text.substring(lastIndex, index), styles: [...styleStack] });
    }

    if (match[1]) {
      // Markdown link: [text](url)
      fragments.push({ type: 'link', text: match[2], url: match[3], styles: [...styleStack] });
    } else if (match[4]) {
      // Bare URL
      fragments.push({ type: 'link', text: match[4], url: match[4], styles: [...styleStack] });
    } else if (match[5]) {
      // Inline style token: **, __, *, _, `
      const token = match[5];
      if (token === '**' || token === '__') {
        const idx = styleStack.indexOf('bold');
        idx > -1 ? styleStack.splice(idx, 1) : styleStack.push('bold');
      } else if (token === '*' || token === '_') {
        const idx = styleStack.indexOf('italic');
        idx > -1 ? styleStack.splice(idx, 1) : styleStack.push('italic');
      } else if (token === '`') {
        const idx = styleStack.indexOf('code');
        idx > -1 ? styleStack.splice(idx, 1) : styleStack.push('code');
      }
    }

    lastIndex = combinedRegex.lastIndex;
  }

  // Remaining tail text
  if (lastIndex < text.length) {
    fragments.push({ type: 'text', text: text.substring(lastIndex), styles: [...styleStack] });
  }

  if (fragments.length === 0) return text;

  return fragments.map((f, idx) => {
    if (f.type === 'link') {
      return (
        <a
          key={idx}
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline break-all"
        >
          {f.text}
          <ExternalLink size={12} className="flex-shrink-0 opacity-60" />
        </a>
      );
    }

    // text fragment — apply styles
    let el = <span>{f.text}</span>;
    if (f.styles.includes('code')) {
      el = <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-primary rounded text-xs font-mono">{f.text}</code>;
    }
    if (f.styles.includes('bold')) {
      el = <strong className="font-bold text-text-main">{el}</strong>;
    }
    if (f.styles.includes('italic')) {
      el = <em className="italic text-text-muted">{el}</em>;
    }
    return <React.Fragment key={idx}>{el}</React.Fragment>;
  });
}

// ─── Markdown Table Parser ──────────────────────────────────────────────────
function parseMarkdownTable(lines) {
  const parseRow = (row) => {
    const cells = row.split('|').map(c => c.trim());
    if (cells[0] === '') cells.shift();
    if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    return cells;
  };

  if (lines.length < 1) return null;
  const headers = parseRow(lines[0]);

  let bodyStartIdx = 1;
  if (lines.length > 1) {
    const secondRowCells = parseRow(lines[1]);
    if (secondRowCells.every(c => /^[:\-]+$/.test(c))) {
      bodyStartIdx = 2;
    }
  }

  const rows = [];
  for (let r = bodyStartIdx; r < lines.length; r++) {
    const rowCells = parseRow(lines[r]);
    if (rowCells.length > 0) rows.push(rowCells);
  }

  return { headers, rows };
}

// ─── Detect the "category" of a response for theming ────────────────────────
function detectResponseCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('complaint filed') || lower.includes('ticket id') || lower.includes('successfully')) {
    return { icon: CheckCircle2, accent: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Confirmation' };
  }
  if (lower.includes('warning') || lower.includes('critical') || lower.includes('danger') || lower.includes('waterlogging') || lower.includes('flood')) {
    return { icon: AlertTriangle, accent: 'text-amber-500', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Alert' };
  }
  if (lower.includes('status') || lower.includes('pending') || lower.includes('assigned') || lower.includes('in progress') || lower.includes('resolved')) {
    return { icon: Info, accent: 'text-blue-500', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'Status Update' };
  }
  return { icon: FileText, accent: 'text-primary', border: 'border-border-subtle', bg: 'bg-bg-base', label: 'Analysis' };
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function FormattedBotResponse({ content, onSuggestionClick }) {
  if (!content) return null;

  // ── Step 1: Preprocess HTML tags ──────────────────────────────────────
  // Convert <a> tags to markdown links BEFORE stripping HTML
  let cleaned = content
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/br>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<p>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<[^>]*>/g, '');

  // ── Step 2: Split into lines and classify ─────────────────────────────
  const lines = cleaned.split('\n');
  const sections = [];
  const followUps = [];
  let inFollowUps = false;

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) { i++; continue; }

    // Follow-ups section
    if (trimmed.match(/^\**(?:Follow-up[s]?|Suggested|Suggestion[s]?|You can also ask|Suggested Follow-ups):\**$/i)) {
      inFollowUps = true;
      i++;
      continue;
    }
    if (inFollowUps) {
      const s = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (s) followUps.push(s);
      i++;
      continue;
    }

    // Markdown table block (lines starting with |)
    if (trimmed.startsWith('|')) {
      const tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        tableLines.push(lines[j].trim());
        j++;
      }
      const parsed = parseMarkdownTable(tableLines);
      if (parsed) {
        sections.push({ type: 'table', data: parsed });
        i = j;
        continue;
      }
    }

    // Header (# ... ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      sections.push({ type: 'header', level: headerMatch[1].length, text: headerMatch[2].replace(/\*\*/g, '') });
      i++;
      continue;
    }

    // Unordered list item
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      const items = [ulMatch[1]];
      let j = i + 1;
      while (j < lines.length) {
        const nt = lines[j].trim();
        const nm = nt.match(/^[-*•]\s+(.+)$/);
        if (nm) { items.push(nm[1]); j++; }
        else if (nt === '') { j++; }
        else break;
      }
      sections.push({ type: 'list', ordered: false, items });
      i = j;
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      const items = [olMatch[2]];
      let j = i + 1;
      while (j < lines.length) {
        const nt = lines[j].trim();
        const nm = nt.match(/^(\d+)\.\s+(.+)$/);
        if (nm) { items.push(nm[2]); j++; }
        else if (nt === '') { j++; }
        else break;
      }
      sections.push({ type: 'list', ordered: true, items });
      i = j;
      continue;
    }

    // Key: Value pair → rendered as structured table rows
    // Now also matches lines where the value may be empty (e.g. "Grievance-portal:")
    const kvMatch = trimmed.match(/^[-*•]?\s*\**([^:]{1,40}):\**\s*(.*)$/);
    if (kvMatch && kvMatch[1].replace(/\*\*/g, '').trim().length > 0) {
      const label = kvMatch[1].replace(/\*\*/g, '').trim();
      const value = (kvMatch[2] || '').replace(/\*\*/g, '').trim();
      const pairs = [{ label, value: value || '—' }];
      let j = i + 1;
      while (j < lines.length) {
        const nt = lines[j].trim();
        if (!nt) { j++; continue; }
        const nm = nt.match(/^[-*•]?\s*\**([^:]{1,40}):\**\s*(.*)$/);
        if (nm && nm[1].replace(/\*\*/g, '').trim().length > 0) {
          const nLabel = nm[1].replace(/\*\*/g, '').trim();
          const nValue = (nm[2] || '').replace(/\*\*/g, '').trim();
          pairs.push({ label: nLabel, value: nValue || '—' });
          j++;
        } else break;
      }
      sections.push({ type: 'kv', pairs });
      i = j;
      continue;
    }

    // Default: paragraph text
    const pLines = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const nt = lines[j].trim();
      if (nt === '' || nt.startsWith('|') || nt.match(/^#{1,6}\s+/) || nt.match(/^[-*•]\s+/) || nt.match(/^\d+\.\s+/) || nt.match(/^[-*•]?\s*\**[^:]{1,40}:\**\s+/)) break;
      pLines.push(nt);
      j++;
    }
    sections.push({ type: 'paragraph', text: pLines.join(' ').replace(/\*\*/g, '') });
    i = j;
  }

  // ── Step 3: Detect theme category ─────────────────────────────────────
  const category = detectResponseCategory(cleaned);
  const CategoryIcon = category.icon;

  // ── Step 4: Render everything inside a structured card ────────────────
  return (
    <div className="w-full space-y-3">
      {/* ═══ Main Response Card ═══ */}
      <div className={`rounded-2xl border ${category.border} ${category.bg} overflow-hidden shadow-sm`}>

        {/* Card Header Badge */}
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${category.border}`}>
          <CategoryIcon size={14} className={category.accent} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${category.accent}`}>
            {category.label}
          </span>
        </div>

        {/* Card Body */}
        <div className="px-4 py-4 space-y-4">
          {sections.map((section, idx) => {
            switch (section.type) {

              // ─── Section Header ───
              case 'header': {
                const sizeClass =
                  section.level <= 1 ? 'text-lg font-extrabold tracking-tight' :
                  section.level === 2 ? 'text-base font-bold tracking-tight' :
                  'text-sm font-bold';
                return (
                  <div key={idx} className={`${sizeClass} text-text-main ${idx > 0 ? 'pt-2 mt-2 border-t border-border-subtle' : ''}`}>
                    {parseInlineMarkdown(section.text)}
                  </div>
                );
              }

              // ─── Key-Value Pairs (structured table rows) ───
              case 'kv': {
                return (
                  <div key={idx} className="rounded-xl border border-border-subtle overflow-hidden bg-bg-surface shadow-sm">
                    <table className="min-w-full text-sm">
                      <tbody className="divide-y divide-border-subtle">
                        {section.pairs.map((pair, pIdx) => (
                          <tr key={pIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-text-main whitespace-nowrap w-[40%] bg-bg-base/50">
                              {parseInlineMarkdown(pair.label)}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-text-muted">
                              {parseInlineMarkdown(pair.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // ─── Full Markdown Table ───
              case 'table': {
                const { headers, rows } = section.data;
                return (
                  <div key={idx} className="rounded-xl border border-border-subtle overflow-hidden bg-bg-surface shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-subtle text-sm">
                      <thead className="bg-bg-base">
                        <tr>
                          {headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                              {parseInlineMarkdown(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-text-main font-medium">
                                {cell ? parseInlineMarkdown(cell) : <span className="text-text-muted opacity-50">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // ─── List (ordered / unordered) ───
              case 'list': {
                return (
                  <div key={idx} className="rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-sm">
                    {section.ordered ? (
                      <ol className="space-y-2 text-sm font-medium text-text-main">
                        {section.items.map((item, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                              {iIdx + 1}
                            </span>
                            <span className="leading-relaxed">{parseInlineMarkdown(item)}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="space-y-2 text-sm font-medium text-text-main">
                        {section.items.map((item, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                            <span className="leading-relaxed">{parseInlineMarkdown(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }

              // ─── Paragraph ───
              case 'paragraph':
              default:
                return (
                  <p key={idx} className="text-sm font-medium text-text-main leading-relaxed">
                    {parseInlineMarkdown(section.text)}
                  </p>
                );
            }
          })}
        </div>
      </div>

      {/* ═══ Follow-up Suggestion Cards ═══ */}
      {followUps.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Suggested Follow-ups</p>
          <div className="flex flex-col gap-2">
            {followUps.map((suggestion, idx) => (
              <button
                key={idx}
                className="text-left w-full flex items-center justify-between px-4 py-2.5 bg-primary/5 text-primary rounded-xl text-sm font-semibold border border-primary/10 hover:bg-primary/10 transition-colors"
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              >
                <span className="truncate pr-2">{suggestion}</span>
                <ChevronRight size={16} className="opacity-50 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
