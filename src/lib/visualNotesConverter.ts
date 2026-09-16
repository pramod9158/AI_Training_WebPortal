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
  const hasChapters = /##\s*[📖⚡🛠️🎯🚀🔬💡🛡️🗺️]\s*Chapter/i.test(text);

  if (hasMasterclassHeader && hasExecutiveSummary && hasChapters) {
    return text;
  }

  // 1. Extract or determine Title
  let title = fallbackTitle?.trim() || '';
  let body = text;

  // Check for first heading in markdown (# Title or ## Title)
  const firstHeadingMatch = text.match(/^(?:#|##)\s+(.+)$/m);
  if (firstHeadingMatch && (!title || title === 'Topic Notes' || title === 'Topic Notes Preview')) {
    title = firstHeadingMatch[1].replace(/^[🧠📖⚡🛠️🎯🚀🔬💡🛡️\s]+/, '').replace(/^Masterclass:\s*/i, '').trim();
  }

  if (!title) {
    // Check first non-empty line
    const firstLine = text.split('\n').find(l => l.trim().length > 0)?.trim() || '';
    if (firstLine.length > 0 && firstLine.length < 80 && !firstLine.startsWith('```')) {
      title = firstLine.replace(/^[#*\-_\s]+/, '').trim();
    } else {
      title = 'Masterclass Technical Guide';
    }
  }

  // Remove duplicate initial # Title if it matches or starts the document
  body = body.replace(/^#\s+[^\n]+\n*/, '').trim();

  // 2. Discover sections / topics in the document to customize the Architectural Mind Map
  const sectionTitles: string[] = [];
  const lines = body.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match ## Heading, ### Heading, or standalone **Bold Heading**
    const h2Match = trimmed.match(/^##\s+([^#\n]+)$/);
    const h3Match = trimmed.match(/^###\s+([^#\n]+)$/);
    const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);

    const candidate = h2Match?.[1] || h3Match?.[1] || boldMatch?.[1];
    if (candidate) {
      const cleanCandidate = candidate
        .replace(/^[📖⚡🛠️🎯🚀🔬💡🛡️🗺️🧠\d.:\-\s]+/, '')
        .replace(/\*\*/g, '')
        .trim();
      if (cleanCandidate.length > 2 && cleanCandidate.length < 40 && !sectionTitles.includes(cleanCandidate)) {
        sectionTitles.push(cleanCandidate);
      }
    }
  }

  // 3. Extract or Synthesize Executive Summary
  let executiveSummary = '';
  
  // Look for explicit summary / overview sections
  const explicitSummaryMatch = body.match(
    /(?:##\s*(?:Overview|Introduction|Executive Summary|Summary|About)[^\n]*\n+)([\s\S]*?)(?=\n##|\n---|$)/i
  );

  if (explicitSummaryMatch && explicitSummaryMatch[1].trim().length > 20) {
    executiveSummary = explicitSummaryMatch[1]
      .trim()
      .replace(/^>\s*/gm, '')
      .replace(/^\[!(?:IMPORTANT|NOTE|TIP|WARNING)\]\s*/gm, '')
      .replace(/^\*\*Executive Summary\*\*:\s*/i, '')
      .trim();
    // Remove the explicit summary section from body so it's not duplicated
    body = body.replace(explicitSummaryMatch[0], '').trim();
  } else {
    // Grab first non-heading paragraph from body as the executive summary
    const paragraphs = body.split(/\n\s*\n/);
    const firstPara = paragraphs.find(p => {
      const t = p.trim();
      return t.length > 30 && !t.startsWith('#') && !t.startsWith('```') && !t.startsWith('-') && !t.startsWith('*');
    });

    if (firstPara && firstPara.length > 30) {
      executiveSummary = firstPara.trim();
      // Remove it from body
      body = body.replace(firstPara, '').trim();
    } else {
      executiveSummary = `This masterclass provides an exhaustive technical specification, core production architectures, and practical implementation patterns for ${title}. Candidates will master architectural trade-offs, deployment patterns, and operational guardrails.`;
    }
  }

  // Clean up markdown blockquotes from executive summary
  executiveSummary = executiveSummary.replace(/^>\s*/gm, '').trim();

  // 4. Extract or Generate Architectural Mind Map
  let hasMindMap = /```(?:text)?\s*\n\s*[┌─│┬┴┼▼▲►◄═║╔╗╚╝]/.test(body);
  let mindMapBlock = '';

  if (!hasMindMap) {
    // Generate an authentic ASCII architecture mind map tailored to the topic and sections found
    const upperTitle = title.toUpperCase().slice(0, 48);
    const titlePad = Math.max(1, Math.floor((58 - upperTitle.length) / 2));
    const titlePadLeft = ' '.repeat(titlePad);
    const titlePadRight = ' '.repeat(Math.max(1, 58 - upperTitle.length - titlePad));

    // Choose 4 phases based on extracted sections or defaults
    const phases = [
      (sectionTitles[0] || 'Foundations & Theory').slice(0, 15),
      (sectionTitles[1] || 'Core Architecture').slice(0, 15),
      (sectionTitles[2] || 'Optimization & Scale').slice(0, 15),
      (sectionTitles[3] || 'Production Runtime').slice(0, 15),
    ];

    const p1 = phases[0].padEnd(13).slice(0, 13);
    const p2 = phases[1].padEnd(13).slice(0, 13);
    const p3 = phases[2].padEnd(13).slice(0, 13);
    const p4 = phases[3].padEnd(13).slice(0, 13);

    mindMapBlock = `
## 🗺️ Architectural Mind Map: Technical Execution Spectrum

\`\`\`text
                  ┌────────────────────────────────────────────────────────────┐
                  │${titlePadLeft}${upperTitle}${titlePadRight}│
                  └─────────────────────────────┬──────────────────────────────┘
                                                │
        ┌───────────────────────┬───────────────┴───────────────┬───────────────────────┐
        │                       │                               │                       │
 ┌──────▼──────┐         ┌──────▼──────┐                 ┌──────▼──────┐         ┌──────▼──────┐
 │  Phase 01   │         │  Phase 02   │                 │  Phase 03   │         │  Phase 04   │
 │${p1}│         │${p2}│                 │${p3}│         │${p4}│
 └──────┬──────┘         └──────┬──────┘                 └──────┬──────┘         └──────┬──────┘
        │                       │                               │                       │
   Core Concepts           System Pipeline                 Benchmarking            Continuous
   & Parameters            & Orchestration                 & Optimization          Monitoring
\`\`\`

---
`;
  }

  // 5. Format Headings & Chapters with Emojis
  const chapterEmojis = ['📖', '⚡', '🛠️', '🎯', '🚀', '🔬', '💡', '🛡️', '📊', '🧩'];
  let chapterIndex = 1;

  const rawLines = body.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Transform ## Headings into Chapter Badges
    if (/^##\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^##\s+/, '').trim();

      // Don't modify if it's already Mind Map
      if (/Mind Map|Architectural/i.test(headingText)) {
        processedLines.push(line);
        continue;
      }

      // If heading doesn't already have an emoji or chapter prefix
      if (!/^(?:Chapter|\d|[📖⚡🛠️🎯🚀🔬💡🛡️📊🧩])/.test(headingText)) {
        const emoji = chapterEmojis[(chapterIndex - 1) % chapterEmojis.length];
        processedLines.push('');
        processedLines.push('---');
        processedLines.push('');
        processedLines.push(`## ${emoji} Chapter ${chapterIndex}: ${headingText}`);
        chapterIndex++;
        continue;
      }
    }

    // Transform standalone ### into numbered sub-sections
    if (/^###\s+/.test(trimmed)) {
      const subHeadingText = trimmed.replace(/^###\s+/, '').trim();
      if (!/^\d+\.\d+/.test(subHeadingText)) {
        const currentChapter = Math.max(1, chapterIndex - 1);
        processedLines.push(`### ${currentChapter}.${i % 5 + 1} ${subHeadingText}`);
        continue;
      }
    }

    // Callout keywords conversion
    if (/^(?:Note|NB|Info):/i.test(trimmed)) {
      const cleanLine = trimmed.replace(/^(?:Note|NB|Info):\s*/i, '');
      processedLines.push('> [!NOTE]');
      processedLines.push(`> **Architecture Note**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Tip|Best Practice|Pro Tip):/i.test(trimmed)) {
      const cleanLine = trimmed.replace(/^(?:Tip|Best Practice|Pro Tip):\s*/i, '');
      processedLines.push('> [!TIP]');
      processedLines.push(`> **Production Best Practice**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Warning|Caution|Alert):/i.test(trimmed)) {
      const cleanLine = trimmed.replace(/^(?:Warning|Caution|Alert):\s*/i, '');
      processedLines.push('> [!WARNING]');
      processedLines.push(`> **Critical Caution**: ${cleanLine}`);
      continue;
    }

    if (/^(?:Important|Key Takeaway):/i.test(trimmed)) {
      const cleanLine = trimmed.replace(/^(?:Important|Key Takeaway):\s*/i, '');
      processedLines.push('> [!IMPORTANT]');
      processedLines.push(`> **Core Specification**: ${cleanLine}`);
      continue;
    }

    // Auto-tag code blocks missing language with python or text
    if (trimmed === '```') {
      // Look ahead to check if this is opening or closing
      const prevCodeOpens = processedLines.filter(l => l.trim().startsWith('```')).length;
      if (prevCodeOpens % 2 === 0) {
        // Opening code block without language
        processedLines.push('```python');
        continue;
      }
    }

    processedLines.push(line);
  }

  // If no ## chapters were created because original text had no ##, convert paragraphs or bullet points
  if (chapterIndex === 1) {
    // Text had no ## headings. Let's create chapters from first few sections or paragraphs
    const rebuiltLines: string[] = [];
    let syntheticChapter = 1;

    for (let j = 0; j < processedLines.length; j++) {
      const l = processedLines[j];
      // If line is bold header or numbered item
      if (/^\*\*[^*]+\*\*$/.test(l.trim()) || /^\d+\.\s+[A-Z]/.test(l.trim())) {
        const clean = l.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').trim();
        const emoji = chapterEmojis[(syntheticChapter - 1) % chapterEmojis.length];
        rebuiltLines.push('');
        rebuiltLines.push('---');
        rebuiltLines.push(`## ${emoji} Chapter ${syntheticChapter}: ${clean}`);
        syntheticChapter++;
        continue;
      }
      rebuiltLines.push(l);
    }
    if (syntheticChapter > 1) {
      processedLines.length = 0;
      processedLines.push(...rebuiltLines);
    }
  }

  const formattedBody = processedLines.join('\n').trim();

  // 6. Assemble the Masterclass document
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
> - Monitor inferencing latency, token consumption, and memory allocation under real-world loads.
> - Maintain versioned test cases and regression checkpoints for production stability.
`.trim();

  return finalNotes;
}
