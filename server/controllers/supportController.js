import OpenAI from 'openai';
import { dataService } from '../services/dataService.js';

const FALLBACK_REPLY =
  'Sorry, I am unable to respond right now. Please try again later.';

const SUPPORT_SYSTEM_PROMPT =
  'You are a helpful support assistant for PainPointFinder, an AI-powered problem discovery and startup validation platform. Help users with their complaints, questions, and issues about the platform. Be friendly and concise.';

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildMessages = (message, chatHistory = []) => {
  const historyMessages = (chatHistory || [])
    .filter((m) => m.role && m.content)
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  return [
    { role: 'system', content: SUPPORT_SYSTEM_PROMPT },
    ...historyMessages,
    { role: 'user', content: message },
  ];
};

const ruleBasedReply = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('find') || lower.includes('search') || lower.includes('problem')) {
    return 'Go to the Dashboard, enter a keyword, and click "Find Problems". Results appear from Reddit, YouTube, NewsAPI, Stack Exchange, and more. Then click "Finalize" for an AI validation report.';
  }
  if (lower.includes('api') || lower.includes('key')) {
    return 'Add your API keys in the root .env file on the server. The Settings page also lets you store keys locally for reference.';
  }
  if (lower.includes('finalize') || lower.includes('validation')) {
    return 'After finding problems, click the green "Finalize" button to generate opportunity scores, market saturation, and top validated opportunities.';
  }
  if (lower.includes('history')) {
    return 'Open the History page from the navbar to view past searches, scores, and reload any search on the Dashboard.';
  }
  return 'Thanks for reaching out! PainPointFinder helps you discover real-world problems and validate startup ideas. Try a keyword search on the Dashboard, or describe your issue in more detail and I will help.';
};

export const supportChat = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const client = getClient();

    if (!client) {
      return res.json({ reply: ruleBasedReply(message.trim()) });
    }

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: buildMessages(message.trim(), chatHistory),
        max_tokens: 400,
        temperature: 0.5,
      });

      const reply = response.choices[0]?.message?.content?.trim();
      res.json({ reply: reply || ruleBasedReply(message.trim()) });
    } catch (aiError) {
      console.error('supportChat OpenAI error:', aiError.message);
      res.json({ reply: FALLBACK_REPLY });
    }
  } catch (error) {
    console.error('supportChat error:', error.message);
    res.status(500).json({ reply: FALLBACK_REPLY });
  }
};

export const submitComplaint = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Complaint message is required' });
    }

    const userId = req.user?._id || req.user?.id || null;

    await dataService.createComplaint({
      userId,
      message: message.trim(),
      status: 'open',
    });

    res.status(201).json({
      message: 'Your complaint has been submitted successfully. Our team will review it soon.',
    });
  } catch (error) {
    console.error('submitComplaint error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to submit complaint' });
  }
};
