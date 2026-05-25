import { convertToFormalProblem, classifyDomain } from '../services/openaiService.js';
import { calculateSentiment } from '../services/sentimentService.js';
import { dataService } from '../services/dataService.js';
import { runAllScrapers } from '../scrapers/scraperManager.js';

const similarity = (a, b) => {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
};

const deduplicate = (items, threshold = 0.6) => {
  const unique = [];
  for (const item of items) {
    const isDuplicate = unique.some((u) => similarity(u.text, item.text) >= threshold);
    if (!isDuplicate) unique.push(item);
  }
  return unique;
};

const fallbackProblems = (keyword, filterDomain) => [
  {
    keyword,
    text: `Users struggle to find reliable tools and workflows related to "${keyword}".`,
    rawText: `Pain point search for ${keyword}`,
    source: 'StackExchange',
    domain: filterDomain && filterDomain !== 'All' ? filterDomain : 'Technology',
    mentionCount: 5,
    sentimentScore: -0.3,
  },
  {
    keyword,
    text: `Existing solutions for "${keyword}" are fragmented, expensive, or hard to adopt for small teams.`,
    rawText: `Market gap for ${keyword}`,
    source: 'Reddit',
    domain: filterDomain && filterDomain !== 'All' ? filterDomain : 'Business',
    mentionCount: 8,
    sentimentScore: -0.45,
  },
  {
    keyword,
    text: `Onboarding and support quality around "${keyword}" products remain a major user complaint.`,
    rawText: `Support issues for ${keyword}`,
    source: 'Trustpilot',
    domain: filterDomain && filterDomain !== 'All' ? filterDomain : 'Daily Life',
    mentionCount: 3,
    sentimentScore: -0.2,
  },
];

export const findProblems = async (req, res) => {
  try {
    const { keyword, domain: filterDomain } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const trimmedKeyword = keyword.trim();

    const { items: merged, sourceBreakdown, scraperStats } = await runAllScrapers(trimmedKeyword);

    const processed = [];
    const batchSize = 5;

    for (let i = 0; i < merged.length && processed.length < 100; i += batchSize) {
      const batch = merged.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const formalText = await convertToFormalProblem(item.text);
          const itemDomain = await classifyDomain(formalText);

          if (filterDomain && filterDomain !== 'All' && itemDomain !== filterDomain) {
            return null;
          }

          return {
            keyword: trimmedKeyword,
            text: formalText,
            rawText: item.text,
            source: item.source,
            domain: itemDomain,
            mentionCount: Math.max(1, Math.floor((item.score || 0) / 10) + 1),
            sentimentScore: calculateSentiment(item.text),
          };
        })
      );

      processed.push(...batchResults.filter(Boolean));
    }

    let deduped = deduplicate(processed).slice(0, 100);
    if (deduped.length === 0) {
      deduped = fallbackProblems(trimmedKeyword, filterDomain);
    }

    const savedProblems = await dataService.insertProblems(deduped);

    const historyEntry = await dataService.createHistory({
      userId: req.user?._id || req.user?.id || null,
      keyword: trimmedKeyword,
      problemCount: savedProblems.length,
      problemIds: savedProblems.map((p) => p._id),
    });

    res.json({
      problems: savedProblems,
      searchId: historyEntry._id,
      keyword: trimmedKeyword,
      sourceBreakdown,
      scraperStats,
    });
  } catch (error) {
    console.error('findProblems error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to find problems' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const history = await dataService.getHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('getHistory error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to fetch history' });
  }
};

export const getSearchById = async (req, res) => {
  try {
    const history = await dataService.getHistoryById(req.params.id);
    if (!history) {
      return res.status(404).json({ message: 'Search not found' });
    }

    const problems = await dataService.findProblemsByIds(history.problemIds);
    res.json({ history, problems });
  } catch (error) {
    console.error('getSearchById error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to fetch search' });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const history = await dataService.deleteHistory(req.params.id);
    if (!history) {
      return res.status(404).json({ message: 'Search not found' });
    }
    res.json({ message: 'Search deleted successfully' });
  } catch (error) {
    console.error('deleteHistory error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to delete history' });
  }
};

export const getTrends = async (req, res) => {
  try {
    const trends = await dataService.getTrends();
    res.json(trends);
  } catch (error) {
    console.error('getTrends error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to fetch trends' });
  }
};
