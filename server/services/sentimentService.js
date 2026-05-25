export const calculateSentiment = (text) => {
  const negativeWords = ['hate', 'terrible', 'awful', 'broken', 'frustrated', 'annoying', 'worst', 'fail', 'bug', 'issue', 'problem', 'difficult', 'hard', 'slow', 'expensive', 'confusing'];
  const positiveWords = ['love', 'great', 'amazing', 'excellent', 'easy', 'fast', 'helpful', 'perfect', 'best', 'wonderful'];

  const lower = text.toLowerCase();
  let score = 0;

  negativeWords.forEach((word) => {
    if (lower.includes(word)) score -= 0.15;
  });

  positiveWords.forEach((word) => {
    if (lower.includes(word)) score += 0.1;
  });

  return Math.max(-1, Math.min(1, score));
};
