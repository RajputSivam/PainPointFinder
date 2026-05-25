import OpenAI from 'openai';

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const convertToFormalProblem = async (rawText) => {
  try {
    const client = getClient();
    if (!client) {
      return rawText.slice(0, 200);
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at converting raw user complaints into formal, structured problem statements. Return only the formal problem statement, nothing else. Maximum 2 sentences.',
        },
        { role: 'user', content: rawText },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || rawText.slice(0, 200);
  } catch (error) {
    console.error('convertToFormalProblem fallback:', error.message);
    return rawText.slice(0, 200);
  }
};

export const classifyDomain = async (text) => {
  const validDomains = ['Education', 'Healthcare', 'Finance', 'Technology', 'Daily Life', 'Business'];

  try {
    const client = getClient();
    if (!client) {
      return 'Technology';
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Classify the following text into exactly one of these domains: ${validDomains.join(', ')}. Return only the domain name, nothing else.`,
        },
        { role: 'user', content: text },
      ],
      max_tokens: 20,
      temperature: 0,
    });

    const domain = response.choices[0]?.message?.content?.trim();
    return validDomains.includes(domain) ? domain : 'Technology';
  } catch (error) {
    console.error('classifyDomain fallback:', error.message);
    return 'Technology';
  }
};

export const calculateOpportunityScore = async (problems) => {
  const fallback = {
    opportunityScore: 55,
    successProbability: 50,
    marketSaturation: 45,
    competitorCount: 12,
    trend: 'Stable',
    topOpportunities: problems.slice(0, 3).map((p, i) => ({
      title: p.text,
      score: 70 - i * 5,
      userCount: p.mentionCount * 1000,
      competitorCount: 10 + i,
      trend: 'Growing',
    })),
  };

  try {
    const client = getClient();
    if (!client) return fallback;

    const problemTexts = problems.slice(0, 10).map((p, i) => `${i + 1}. ${p.text}`).join('\n');

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a startup analyst. Analyze these problems and return a JSON object with: opportunityScore (0-100), successProbability (0-100), marketSaturation (0-100), competitorCount (number), trend (Growing/Stable/Declining), topOpportunities (array of 3 best problem titles with scores, each having title, score, userCount, competitorCount, trend). Return only valid JSON.',
        },
        { role: 'user', content: problemTexts },
      ],
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    return { ...fallback, ...parsed };
  } catch (error) {
    console.error('calculateOpportunityScore fallback:', error.message);
    return fallback;
  }
};
