/**
 * Visual Notes Converter & Sanitizer
 * Ensures notes strictly preserve the user's uploaded markdown content without injecting
 * any artificial mind maps, fake executive summaries, fake chapter prefixes, or fake takeaways.
 */

/**
 * Cleans notes content by removing any previously injected boilerplate
 * (such as auto-generated mind maps, fake "Key Takeaway & Production Checklist" blocks,
 * and synthetic "Chapter X:" heading prefixes), and normalizing whitespace.
 */
export function cleanNotesContent(rawMarkdown: string): string {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') return '';
  let text = rawMarkdown.replace(/\r\n/g, '\n');

  // 1. Remove auto-generated "Key Takeaway & Production Checklist" callout blocks
  // Both blockquoted (> [!TIP]) and plain forms
  text = text.replace(
    />\s*\[!TIP\]\s*\n>\s*\*\*Key Takeaway & Production Checklist\*\*:\s*\n(?:>\s*-[^\n]*\n*)+/gi,
    ''
  );
  text = text.replace(
    /\[!TIP\]\s*\*\*?Key Takeaway & Production Checklist\*\*?:[\s\S]*?Maintain versioned test cases[^\n]*\n*/gi,
    ''
  );
  text = text.replace(
    />\s*\*\*Key Takeaway & Production Checklist\*\*:\s*\n(?:>\s*-[^\n]*\n*)+/gi,
    ''
  );

  // 2. Remove auto-generated Architectural Mind Map blocks
  text = text.replace(
    /##\s*🗺️\s*Architectural Mind Map: Technical Execution Spectrum\s*\n+```(?:text)?[\s\S]*?```\s*(?:---\s*)?/gi,
    ''
  );

  // 3. Remove auto-generated synthetic Executive Summary
  text = text.replace(
    />\s*\[!IMPORTANT\]\s*\n>\s*\*\*Executive Summary\*\*:\s*This masterclass provides an exhaustive technical specification[\s\S]*?(?:---\s*)?/gi,
    ''
  );

  // 4. Remove synthetic "Masterclass:" prefix from title
  text = text.replace(/^#\s*🧠\s*Masterclass:\s*/im, '# ');

  // 5. Remove synthetic "Chapter X:" prefixes added to user headings or list items
  // e.g., "## 📖 Chapter 1: 1. Lab-reported..." -> "## 1. Lab-reported..."
  text = text.replace(
    /^##\s*[📖⚡🛠️🎯🚀🔬💡🛡️📊🧩]\s*Chapter\s*\d+:\s*/gim,
    '## '
  );
  // e.g., "### 1.1 1. Lab-reported..." -> "### "
  text = text.replace(
    /^###\s*\d+\.\d+\s+/gim,
    '### '
  );

  // 6. Clean up repetitive or orphaned horizontal dividers (---) and excess empty lines
  text = text.replace(/(?:^[ \t]*---[ \t]*\n+){2,}/gm, '---\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Returns clean, properly formatted notes preserving ONLY what the author wrote.
 * Does NOT generate mind maps, executive summaries, or key takeaways.
 */
export function convertMarkdownToVisualNotes(rawMarkdown: string, _fallbackTitle?: string): string {
  return cleanNotesContent(rawMarkdown);
}
