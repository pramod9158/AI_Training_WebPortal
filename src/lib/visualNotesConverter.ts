/**
 * Visual Notes Converter
 * Converts uploaded raw Markdown (.md) or plain notes into the high-impact,
 * visually appealing Masterclass format used in Waynautic Academy (e.g. Advanced Techniques).
 */

export function convertMarkdownToVisualNotes(rawMarkdown: string, fallbackTitle?: string): string {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') return '';
  const text = rawMarkdown.replace(/\r\n/g, '\n').trim();

  // If the document is already in full masterclass format with executive summary and callouts, return clean version
  const hasMasterclassHeader = /#\s*.*Masterclass/i.test(text);
  const hasExecutiveSummary = /\[!IMPORTANT\]\s*\n>\s*\*\*Executive Summary\*\*/i.test(text);
  if (hasMasterclassHeader && hasExecutiveSummary) {
    return text;
  }

  // 1. Extract or determine Title
  let title = fallbackTitle || 'Masterclass Technical Guide';
  let body = text;

  const firstHeadingMatch = text.match(/^#\s+(.+)$/m);
  if (firstHeadingMatch) {
    title = firstHeadingMatch[1].replace(/^[🧠📖⚡🛠️🎯🚀\s]+/, '').trim();
    // Remove the original first h1 so we can reformat it
    body = body.replace(/^#\s+.+$/m, '').trim();
  }

  // 2. Extract Executive Summary or Introduction
  let executiveSummary = '';
  const execSummaryMatch = body.match(
    /(?:##\s*(?:Overview|Introduction|Executive Summary|Summary)[^\n]*\n+)?([\s\S]*?)(?=\n##|\n---|$)/i
  );

  if (execSummaryMatch && execSummaryMatch[1].trim().length > 30) {
    // Found an introductory chunk
    const rawSummary = execSummaryMatch[1].trim();
    // Strip leading blockquotes if any
    executiveSummary = rawSummary
      .replace(/^>\s*/gm, '')
      .replace(/^\[!(?:IMPORTANT|NOTE|TIP|WARNING)\]\s*/gm, '')
      .replace(/^\*\*Executive Summary\*\*:\s*/i, '')
      .trim();

    // Remove the matched intro from body so it isn't duplicated
    body = body.replace(execSummaryMatch[0], '').trim();
  } else {
    // Synthesize a comprehensive summary based on title
    executiveSummary = `This masterclass covers production-grade architectural patterns, practical code workflows, and technical foundations for ${title}. Engineers will master key concepts, avoid common edge cases, and apply hands-on implementations.`;
  }

  // 3. Extract or Generate Architectural Mind Map
  let hasMindMap = /```(?:text)?\s*\n\s*[┌─│┬┴┼▼▲►◄═║╔╗╚╝]/.test(body);
  let mindMapBlock = '';

  if (!hasMindMap) {
    // Generate a sleek ASCII architecture mind map based on the topic
    const upperTitle = title.toUpperCase().slice(0, 45);
    const padLen = Math.max(1, Math.floor((55 - upperTitle.length) / 2));
    const padLeft = ' '.repeat(padLen);
    const padRight = ' '.repeat(Math.max(1, 55 - upperTitle.length - padLen));

    mindMapBlock = `
## 🗺️ Architectural Mind Map: Core Technical Flow

\`\`\`text
                  ┌─────────────────────────────────────────────────────────────┐
                  │${padLeft}${upperTitle}${padRight}│
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
        ┌───────────────────────┬────────────────┴───────────────────────┬───────────────────────┐
        │                       │                                        │                       │
 ┌──────▼──────┐         ┌──────▼──────┐                          ┌──────▼──────┐         ┌──────▼──────┐
 │  Phase 01   │         │  Phase 02   │                          │  Phase 03   │         │  Phase 04   │
 │ Architecture│         │ Integration │                          │ Performance │         │ Production  │
 └──────┬──────┘         └──────┬──────┘                          └──────┬──────┘         └──────┬──────┘
        │                       │                                        │                       │
   Core Theory             API & Pipeline                           Latency & Caching       Monitoring &
   & Foundations           Orchestration                            Optimization            Deployment
\`\`\`

---
`;
  }

  // 4. Format Headings & Chapters
  const chapterEmojis = ['📖', '⚡', '🛠️', '🎯', '🚀', '🔬', '💡', '🛡️'];
  let chapterIndex = 1;

  // Process ## headings
  const lines = body.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect ## Headings
    if (/^##\s+/.test(line)) {
      const headingText = line.replace(/^##\s+/, '').trim();

      // If heading doesn't already have an emoji or chapter prefix
      if (!/^(?:Chapter|\d|[📖⚡🛠️🎯🚀🗺️🧠🔬💡🛡️])/.test(headingText)) {
        const emoji = chapterEmojis[(chapterIndex - 1) % chapterEmojis.length];
        processedLines.push('---');
        processedLines.push('');
        processedLines.push(`## ${emoji} Chapter ${chapterIndex}: ${headingText}`);
        chapterIndex++;
        continue;
      }
    }

    // Callout keywords conversion
    if (/^(?:Note|NB|Info):/i.test(line)) {
      const cleanLine = line.replace(/^(?:Note|NB|Info):\s*/i, '');
      processedLines.push('> [!NOTE]');
      processedLines.push(`> **Technical Note**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Tip|Best Practice|Pro Tip):/i.test(line)) {
      const cleanLine = line.replace(/^(?:Tip|Best Practice|Pro Tip):\s*/i, '');
      processedLines.push('> [!TIP]');
      processedLines.push(`> **Production Best Practice**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Warning|Caution|Alert):/i.test(line)) {
      const cleanLine = line.replace(/^(?:Warning|Caution|Alert):\s*/i, '');
      processedLines.push('> [!WARNING]');
      processedLines.push(`> **Critical Caution**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Important|Key Takeaway):/i.test(line)) {
      const cleanLine = line.replace(/^(?:Important|Key Takeaway):\s*/i, '');
      processedLines.push('> [!IMPORTANT]');
      processedLines.push(`> **Important Specification**: ${cleanLine}`);
      continue;
    }

    processedLines.push(line);
  }

  const formattedBody = processedLines.join('\n').trim();

  // 5. Assemble the Masterclass document
  const finalNotes = `# 🧠 Masterclass: ${title}

> [!IMPORTANT]
> **Executive Summary**: ${executiveSummary}

---
${mindMapBlock}
${formattedBody}

---

> [!TIP]
> **Key Takeaway & Production Checklist**:
> - Validate all inputs and enforce strict error boundaries across API layers.
> - Monitor latency, resource consumption, and error states under real-world workloads.
> - Maintain versioned test cases and regression checkpoints for production stability.
`.trim();

  return finalNotes;
}
