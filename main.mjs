import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
const stdin = process.stdin;
const browserUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36 Edg/96.0.1054.41';

async function read(message) {
    console.log(message);
    return new Promise(resolve => stdin.once('data', resolve));
}

async function getAnalytics(website, userAgent) {
    const uri = new URL(website.url);
    const url = 'https://www.similarweb.com/api/websitedata?site=' + uri.hostname.replace('www.', '');
    const response = await fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'referer: https://www.similarweb.com/website/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'User-Agent': userAgent // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36 Edg/96.0.1054.41'
            
        }
    });
    if(response.status === 403) {
        await response.blob();
        console.warn('Please solve the Captcha in your Browser!', url);
        await read('Press enter when done...');
        return getAnalytics(website);
    }
    if(response.status !== 200) {
        throw new Error(response.status, await response.text());
    }
    const data = await response.json();
    return {
        time: data.overview.Date,
        views: data.overview.EngagementsSimilarweb.TotalLastMonthVisits || -1
    }
}

/**
 * Clear and get fresh analytics for all websites
 */
async function overwrite(userAgent) {
    const websites = await fs.readJSON('./websites.json');
    for(let website of websites) {
        console.log(website.title, '=>', website.url);
        try {
            website.analytics = await getAnalytics(website, userAgent);
            console.log('>', 'Fetched', website.analytics);
        } catch(error) {
            website.analytics = {};
            console.warn('>', 'Failed:', error);
        }
        await fs.writeJSON(path.join('.', 'docs', 'websites.json'), websites);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

/**
 * Update only websites with missing/outdated website analytics
 */
async function update(userAgent) {
    const websites = await fs.readJSON(path.join('.', 'docs', 'websites.json'));
    for(let website of websites) {
        console.log(website.title, '=>', website.url);
        if(website.analytics && website.analytics.views) {
            console.log('>', 'Skipped', website.analytics);
            continue;
        }
        try {
            website.analytics = await getAnalytics(website, userAgent);
            console.log('>', 'Fetched', website.analytics);
        } catch(error) {
            website.analytics = {};
            console.warn('>', 'Failed:', error);
        }
        await fs.writeJSON(path.join('.', 'docs', 'websites.json'), websites);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

stdin.resume();
stdin.setEncoding('utf8');
// User-Agent of the Browser which will also be used to solve emerging Captchas
const ua = await read('User-Agent of your Browser:');
await overwrite(ua.trim() || browserUA);
//await update(ua.trim() || browserUA);
stdin.unref();