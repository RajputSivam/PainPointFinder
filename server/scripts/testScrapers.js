import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAllScrapers } from '../scrapers/scraperManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const keyword = process.argv[2] || 'startup tools';

console.log(`\nTesting all scrapers for keyword: "${keyword}"\n`);

const { items, sourceBreakdown, scraperStats } = await runAllScrapers(keyword);

console.log('\n--- Results ---');
console.log('Total items:', items.length);
console.log('Source breakdown:', sourceBreakdown);
console.log('Scraper stats:', JSON.stringify(scraperStats, null, 2));

process.exit(0);
