import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  text: { type: String, required: true },
  rawText: { type: String, required: true },
  source: { type: String, required: true },
  domain: { type: String, required: true },
  mentionCount: { type: Number, default: 1 },
  sentimentScore: { type: Number, default: 0 },
  opportunityScore: { type: Number, default: 0 },
  successProbability: { type: Number, default: 0 },
  marketSaturation: { type: Number, default: 0 },
  competitorCount: { type: Number, default: 0 },
  trend: { type: String, default: 'Stable' },
  createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
