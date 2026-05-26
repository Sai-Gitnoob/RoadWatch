import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function FormattedBotResponse({ content, onSuggestionClick }) {
  if (!content) return null;

  let headline = '';
  let facts = [];
  let context = [];
  let source = '';
  let followUps = [];

  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentSection = 'headline';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check for Source
    const sourceMatch = line.match(/^\**(?:Source|Sources):\**\s*(.+)$/i);
    if (sourceMatch) {
      source = sourceMatch[1].trim();
      continue;
    }

    // Check for Follow-up or Suggestions
    if (line.match(/^\**(?:Follow-up[s]?|Suggested|Suggestion[s]?|You can also ask):\**$/i)) {
      currentSection = 'followups';
      continue;
    }

    if (currentSection === 'followups') {
      const suggestion = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (suggestion) followUps.push(suggestion);
      continue;
    }

    // Skip markdown headers like "## Key Facts"
    if (line.match(/^#+\s+/)) {
      continue;
    }

    // Check for Fact
    const factMatch = line.match(/^[-*•]?\s*\**([^:]+):\**\s*(.+)$/);
    if (factMatch && factMatch[1].length < 35 && currentSection !== 'followups') {
      facts.push({ 
        label: factMatch[1].replace(/\*\*/g, '').trim(), 
        value: factMatch[2].replace(/\*\*/g, '').trim() 
      });
      currentSection = 'facts';
      continue;
    }

    // Normal sentence processing
    if (currentSection === 'headline' && !headline) {
      headline = line.replace(/\*\*/g, '');
      currentSection = 'context';
    } else {
      context.push(line.replace(/\*\*/g, ''));
    }
  }

  // Fallback: If we couldn't structure it at all, render as simple text
  if (facts.length === 0 && !source && followUps.length === 0) {
    return (
      <div className="space-y-3">
        {lines.map((line, i) => (
          <p key={i}>{line.replace(/\*\*/g, '')}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* 1. Headline Summary */}
      {headline && (
        <h3 className="text-xl font-bold text-text-main leading-snug">
          {headline}
        </h3>
      )}

      {/* 2. Key Facts Section */}
      {facts.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm hover:bg-slate-50 transition-standard space-y-2">
          {facts.map((fact, idx) => (
            <div key={idx} className="flex justify-between items-start gap-4 py-1.5 border-b border-border-subtle last:border-0 last:pb-0">
              <span className="text-sm font-bold text-text-main flex-shrink-0">{fact.label}</span>
              <span className="text-sm font-medium text-text-muted text-right break-words">{fact.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Context Explanation */}
      {context.length > 0 && (
        <div className="space-y-2">
          {context.map((paragraph, idx) => (
            <p key={idx} className="text-sm font-medium text-text-main leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* 5. Follow-up Suggestions */}
      {followUps.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Suggested Follow-ups</p>
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

      {/* 4. Source Line */}
      {source && (
        <div className="pt-3 mt-4 border-t border-border-subtle">
          <p className="text-xs font-semibold text-text-muted opacity-80">
            Source: {source}
          </p>
        </div>
      )}
    </div>
  );
}
