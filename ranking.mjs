import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { key } from './key.mjs';

async function info() {
    console.log('API Key:', key);
    const response = await fetch(`https://api.similarweb.com/user-capabilities?api_key=${key}`);
    const data = await response.json();
    console.log('API Status:', data);
}

// Available for Free API Tier
// `https://api.similarweb.com/v1/similar-rank/top-sites?api_key=${key}&limit=5000`
// Non-Free API Tier
// `https://data.similarweb.com/api/v1/data?domain=${domain}`
// `https://www.similarweb.com/api/websitedata?site=${domain}`
// `https://api.similarweb.com/v1/website/${domain}/general-data/all?api_key=${key}`
// `https://api.similarweb.com/v1/website/${domain}/similar-sites/similarsites?api_key=${key}&format=json`
async function rankings() {
    const response = await fetch(`https://api.similarweb.com/v1/similar-rank/top-sites?api_key=${key}&limit=5000`);
    await fs.writeJSON(path.join('.', 'docs', 'ranking.json'), await response.json(), { spaces: 2 });
}

await info();
await rankings();