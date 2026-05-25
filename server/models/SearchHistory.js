import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  keyword: { type: String, required: true },
  problemCount: { type: Number, default: 0 },
  topScore: { type: Number, default: 0 },
  problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  createdAt: { type: Date, default: Date.now },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;
