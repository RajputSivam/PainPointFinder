import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = () => ({
  users: [],
  problems: [],
  history: [],
  complaints: [],
});

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const data = defaultData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      return data;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return defaultData();
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const newId = () => crypto.randomBytes(12).toString('hex');

export const fileStoreEnabled = { value: false };

export const enableFileStore = () => {
  fileStoreEnabled.value = true;
  console.log(`Using JSON file store (${DATA_FILE})`);
};

const withTimestamps = (doc) => ({
  ...doc,
  _id: doc._id || newId(),
  createdAt: doc.createdAt || new Date().toISOString(),
});

export const fileDb = {
  insertManyProblems: (items) => {
    const data = readData();
    const saved = items.map((item) => withTimestamps(item));
    data.problems.push(...saved);
    writeData(data);
    return saved;
  },

  findProblemsByIds: (ids) => {
    const data = readData();
    return data.problems.filter((p) => ids.includes(p._id));
  },

  updateManyProblems: (ids, fields) => {
    const data = readData();
    data.problems = data.problems.map((p) => (ids.includes(p._id) ? { ...p, ...fields } : p));
    writeData(data);
  },

  createHistory: (entry) => {
    const data = readData();
    const saved = withTimestamps(entry);
    data.history.unshift(saved);
    writeData(data);
    return saved;
  },

  findHistory: (userId) => {
    const data = readData();
    const list = userId ? data.history.filter((h) => h.userId === userId) : data.history;
    return list.slice(0, 50);
  },

  findHistoryById: (id) => readData().history.find((h) => h._id === id) || null,

  deleteHistory: (id) => {
    const data = readData();
    const before = data.history.length;
    data.history = data.history.filter((h) => h._id !== id);
    writeData(data);
    return before !== data.history.length;
  },

  updateHistoryByKeyword: (keyword, fields) => {
    const data = readData();
    const entry = data.history.find((h) => h.keyword === keyword);
    if (entry) Object.assign(entry, fields);
    writeData(data);
  },

  aggregateTrends: () => {
    const data = readData();
    const byDate = {};
    const byDomain = {};

    data.problems.forEach((p) => {
      const date = (p.createdAt || new Date().toISOString()).slice(0, 10);
      byDate[date] = (byDate[date] || 0) + 1;
      byDomain[p.domain || 'Unknown'] = (byDomain[p.domain || 'Unknown'] || 0) + 1;
    });

    return {
      frequencyOverTime: Object.entries(byDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      domainCounts: Object.entries(byDomain)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count),
    };
  },

  findUserByEmail: (email) => readData().users.find((u) => u.email === email.toLowerCase()) || null,

  createUser: (user) => {
    const data = readData();
    const saved = withTimestamps({ ...user, email: user.email.toLowerCase() });
    data.users.push(saved);
    writeData(data);
    return saved;
  },

  findUserById: (id) => readData().users.find((u) => u._id === id) || null,

  updateUser: (id, fields) => {
    const data = readData();
    const user = data.users.find((u) => u._id === id);
    if (!user) return null;
    Object.assign(user, fields, { email: fields.email?.toLowerCase() || user.email });
    writeData(data);
    const { password, ...safe } = user;
    return safe;
  },

  createComplaint: (entry) => {
    const data = readData();
    if (!data.complaints) data.complaints = [];
    const saved = withTimestamps({ ...entry, status: entry.status || 'open' });
    data.complaints.unshift(saved);
    writeData(data);
    return saved;
  },
};
