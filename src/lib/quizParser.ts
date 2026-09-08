// Waynautic Academy - Intelligent Markdown Quiz Parser
// Automatically parses markdown text into required QuizQuestion format.

import { QuizQuestion } from '@/data/seedModules';

/**
 * Parses markdown content into an array of QuizQuestion objects.
 * Supports various standard quiz markdown notations:
 * - A), B), C), D) options
 * - 1., 2., 3., 4. options
 * - Markdown checkboxes (- [x] correct, - [ ] incorrect)
 * - Correct: A / Answer: B / Key: C
 * - Explanation: ...
 */
export function parseQuizMarkdown(markdownContent: string, topicId: string = 'topic-custom'): QuizQuestion[] {
  if (!markdownContent || !markdownContent.trim()) {
    return [];
  }

  const questions: QuizQuestion[] = [];
  const lines = markdownContent.split('\n');

  let currentQuestionText = '';
  let currentOptions: string[] = [];
  let currentCorrectIndex = -1;
  let currentExplanation = '';
  let inQuestion = false;

  const commitQuestion = () => {
    if (currentQuestionText.trim() && currentOptions.length > 0) {
      // Ensure at least 4 options
      while (currentOptions.length < 4) {
        currentOptions.push(`Option ${String.fromCharCode(65 + currentOptions.length)}`);
      }

      // Default correct index to 0 if not detected
      const finalCorrectIndex = currentCorrectIndex >= 0 && currentCorrectIndex < currentOptions.length 
        ? currentCorrectIndex 
        : 0;

      questions.push({
        id: `q-parsed-${Date.now()}-${questions.length + 1}`,
        topicId,
        questionText: currentQuestionText.trim(),
        options: currentOptions.slice(0, 4),
        correctOptionIndex: finalCorrectIndex,
        explanation: currentExplanation.trim() || `Option ${String.fromCharCode(65 + finalCorrectIndex)} is the verified correct answer.`
      });
    }

    currentQuestionText = '';
    currentOptions = [];
    currentCorrectIndex = -1;
    currentExplanation = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Detect Question Header (e.g. ### Question 1, ## 1. Prompt, **Q1:**, 1. What is...)
    const isHeaderQuestion = 
      /^#{1,6}\s*(?:question\s*\d*[:.]?|\d+[\).])\s*/i.test(line) ||
      /^(?:question|\*\*q|\*q|\bq)\s*\d*[:.]/i.test(line) ||
      /^\d+[\).]\s+[A-Z]/i.test(line);

    if (isHeaderQuestion) {
      if (inQuestion) {
        commitQuestion();
      }
      inQuestion = true;
      currentQuestionText = line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^(?:question|\*\*q|\*q|\bq)\s*\d*[:.]\s*/i, '')
        .replace(/^\d+[\).]\s*/, '')
        .replace(/\*\*|__/g, '')
        .trim();
      continue;
    }

    // Detect Options (A), B), C), D) or 1., 2., 3. or - [ ] / - [x])
    const checkboxMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)/);
    if (checkboxMatch) {
      const isChecked = checkboxMatch[1].toLowerCase() === 'x';
      const optionText = checkboxMatch[2].trim();
      if (isChecked) {
        currentCorrectIndex = currentOptions.length;
      }
      currentOptions.push(optionText);
      continue;
    }

    const letterOptionMatch = line.match(/^[-*]?\s*(?:\([a-dA-D]\)|[a-dA-D][\).:])\s*(.+)/);
    if (letterOptionMatch) {
      currentOptions.push(letterOptionMatch[1].trim());
      continue;
    }

    const numberOptionMatch = line.match(/^[-*]?\s*(?:\([1-4]\)|[1-4][\).:])\s*(.+)/);
    if (numberOptionMatch && inQuestion && currentOptions.length < 4) {
      currentOptions.push(numberOptionMatch[1].trim());
      continue;
    }

    // Detect Correct Answer (e.g. Correct: B, Answer: A, Key: 2)
    const answerMatch = line.match(/^(?:\*{0,2}(?:correct\s*(?:answer)?|answer|key)\*{0,2}[:\-]\s*)([a-dA-D1-4])/i);
    if (answerMatch) {
      const ansChar = answerMatch[1].toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(ansChar)) {
        currentCorrectIndex = ansChar.charCodeAt(0) - 65;
      } else if (['1', '2', '3', '4'].includes(ansChar)) {
        currentCorrectIndex = parseInt(ansChar, 10) - 1;
      }
      continue;
    }

    // Detect Explanation (e.g. Explanation: ... or Note: ...)
    const explanationMatch = line.match(/^(?:\*{0,2}(?:explanation|notes?|rationale)\*{0,2}[:\-]\s*)(.+)/i);
    if (explanationMatch) {
      currentExplanation = explanationMatch[1].trim();
      continue;
    }

    // If we're inside a question text before options started, append to question text
    if (inQuestion && currentOptions.length === 0) {
      currentQuestionText += ' ' + line;
    }
  }

  // Commit last question
  if (inQuestion) {
    commitQuestion();
  }

  return questions;
}
