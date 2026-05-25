import { isFileStore } from '../config/db.js';
import { fileDb } from '../store/fileStore.js';
import Problem from '../models/Problem.js';
import SearchHistory from '../models/SearchHistory.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

export const dataService = {
  insertProblems: async (items) => {
    if (isFileStore()) return fileDb.insertManyProblems(items);
    return Problem.insertMany(items);
  },

  findProblemsByIds: async (ids) => {
    if (isFileStore()) return fileDb.findProblemsByIds(ids);
    return Problem.find({ _id: { $in: ids } });
  },

  updateProblems: async (ids, fields) => {
    if (isFileStore()) return fileDb.updateManyProblems(ids, fields);
    return Problem.updateMany({ _id: { $in: ids } }, { $set: fields });
  },

  createHistory: async (entry) => {
    if (isFileStore()) return fileDb.createHistory(entry);
    return SearchHistory.create(entry);
  },

  getHistory: async (userId) => {
    if (isFileStore()) return fileDb.findHistory(userId);
    const filter = userId ? { userId } : {};
    return SearchHistory.find(filter).sort({ createdAt: -1 }).limit(50);
  },

  getHistoryById: async (id) => {
    if (isFileStore()) return fileDb.findHistoryById(id);
    return SearchHistory.findById(id);
  },

  deleteHistory: async (id) => {
    if (isFileStore()) {
      const deleted = fileDb.deleteHistory(id);
      return deleted ? { _id: id } : null;
    }
    return SearchHistory.findByIdAndDelete(id);
  },

  updateHistoryByKeyword: async (keyword, fields) => {
    if (isFileStore()) return fileDb.updateHistoryByKeyword(keyword, fields);
    return SearchHistory.findOneAndUpdate({ keyword }, fields, { sort: { createdAt: -1 } });
  },

  getTrends: async () => {
    if (isFileStore()) return fileDb.aggregateTrends();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const frequencyOverTime = await Problem.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    const domainCounts = await Problem.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { domain: '$_id', count: 1, _id: 0 } },
    ]);

    return { frequencyOverTime, domainCounts };
  },

  findUserByEmail: async (email) => {
    if (isFileStore()) return fileDb.findUserByEmail(email);
    return User.findOne({ email: email.toLowerCase() });
  },

  createUser: async (user) => {
    if (isFileStore()) return fileDb.createUser(user);
    return User.create(user);
  },

  findUserById: async (id) => {
    if (isFileStore()) {
      const user = fileDb.findUserById(id);
      if (!user) return null;
      const { password, ...safe } = user;
      return safe;
    }
    return User.findById(id).select('-password');
  },

  updateUser: async (id, fields) => {
    if (isFileStore()) return fileDb.updateUser(id, fields);
    return User.findByIdAndUpdate(id, fields, { new: true, runValidators: true }).select('-password');
  },

  createComplaint: async (entry) => {
    if (isFileStore()) return fileDb.createComplaint(entry);
    return Complaint.create(entry);
  },
};
