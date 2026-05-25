import { calculateOpportunityScore } from '../services/openaiService.js';
import { dataService } from '../services/dataService.js';

export const finalizeProblems = async (req, res) => {
  try {
    const { keyword, problemIds } = req.body;

    if (!problemIds || !Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ message: 'problemIds array is required' });
    }

    const problems = await dataService.findProblemsByIds(problemIds);

    if (problems.length === 0) {
      return res.status(404).json({ message: 'No problems found for given IDs' });
    }

    const topProblems = problems
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 10);

    const analysis = await calculateOpportunityScore(topProblems);

    const updateFields = {
      opportunityScore: analysis.opportunityScore,
      successProbability: analysis.successProbability,
      marketSaturation: analysis.marketSaturation,
      competitorCount: analysis.competitorCount,
      trend: analysis.trend,
    };

    await dataService.updateProblems(problemIds, updateFields);

    const activeDiscussants = topProblems.reduce((sum, p) => sum + p.mentionCount, 0) * 2300;

    const topOpportunities = (analysis.topOpportunities || []).slice(0, 3).map((opp, index) => {
      const matched = topProblems[index] || topProblems[0];
      return {
        title: opp.title || matched?.text || 'Opportunity',
        score: opp.score || analysis.opportunityScore,
        userCount: opp.userCount || matched?.mentionCount * 1000 || 1000,
        competitorCount: opp.competitorCount || analysis.competitorCount,
        trend: opp.trend || analysis.trend,
      };
    });

    if (keyword) {
      await dataService.updateHistoryByKeyword(keyword, { topScore: analysis.opportunityScore });
    }

    res.json({
      opportunityScore: analysis.opportunityScore,
      successProbability: analysis.successProbability,
      marketSaturation: analysis.marketSaturation,
      activeDiscussants,
      topOpportunities,
    });
  } catch (error) {
    console.error('finalizeProblems error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to finalize problems' });
  }
};
