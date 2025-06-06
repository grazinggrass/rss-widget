
import { parseStringPromise } from 'xml2js';

const FEED_URL = 'https://feeds.transistor.fm/grazing-grass-podcast';
const GHL_TOKEN_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/token';
const GHL_POST_ENDPOINT = 'https://services.leadconnectorhq.com/v2/blogs/posts';

async function getFeedItems() {
  console.log("Fetching RSS feed...");
  console.log("FEED URL:", FEED_URL);
  
  const response = await fetch(FEED_URL);
  const xmlText = await response.text();
  const result = await parseStringPromise(xmlText);

  const items = result.rss.channel[0].item;
  const posts = items.map((item) => ({
    title: item.title[0],
    content: item.description[0],
    pubDate: item.pubDate[0]
  }));

  return posts.slice(0, 1); // only latest
}

async function refreshAccessToken() {
  console.log("Refreshing token...");
  console.log("CLIENT_ID:", process.env.GHL_CLIENT_ID);
  console.log("REFRESH_TOKEN:", process.env.GHL_REFRESH_TOKEN);

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
      Authorization: `Bearer ${accessToken}`,
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
  console.log("Received request to publish blog...");

  try {
    const accessToken = await refreshAccessToken();
    const blogs = await getFeedItems();

    const results = [];
    for (const blog of blogs) {
      const posted = await publishToGHL(blog, accessToken);
      results.push(posted);
    }

    console.log("Blog post results:", results);
    res.status(200).json({ status: 'success', results });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}
