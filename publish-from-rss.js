
import fetch from 'node-fetch';

const FEED_URL = 'https://feeds.transistor.fm/grazing-grass-podcast';
const GHL_TOKEN_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/token';
const GHL_POST_ENDPOINT = 'https://services.leadconnectorhq.com/v2/blogs/posts';

async function getFeedItems() {
  const response = await fetch(FEED_URL);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const items = xml.querySelectorAll('item');
  const parsedItems = [];

  items.forEach(item => {
    parsedItems.push({
      title: item.querySelector('title')?.textContent,
      content: item.querySelector('description')?.textContent,
      pubDate: item.querySelector('pubDate')?.textContent
    });
  });

  return parsedItems.slice(0, 1); // Only publish the most recent post for demo
}

async function refreshAccessToken() {
  const res = await fetch(GHL_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: process.env.GHL_REFRESH_TOKEN
    })
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Token refresh failed');
  return data.access_token;
}

async function publishToGHL(blog, accessToken) {
  const res = await fetch(GHL_POST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location_id: process.env.GHL_LOCATION_ID,
      title: blog.title,
      content: blog.content,
      status: 'PUBLISHED'
    })
  });

  const result = await res.json();
  if (res.status >= 400) throw new Error(result.message || 'Blog post failed');
  return result;
}

export default async function handler(req, res) {
  try {
    const accessToken = await refreshAccessToken();
    const blogs = await getFeedItems();

    const results = [];
    for (const blog of blogs) {
      const posted = await publishToGHL(blog, accessToken);
      results.push(posted);
    }

    res.status(200).json({ status: 'success', results });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}
