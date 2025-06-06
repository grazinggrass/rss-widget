// GHL Blog Selector Settings Page with Auto Menu Link Install
// Loads blog list, allows user to select one, saves it, and preloads it on page load.

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GhlBlogSelector() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locationId = new URLSearchParams(window.location.search).get('location_id');
  const accessToken = new URLSearchParams(window.location.search).get('access_token');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/settings?location_id=${locationId}`);
        const data = await res.json();
        if (data.blog_id) {
          setSelectedBlogId(data.blog_id);
          localStorage.setItem('selected_blog_id', data.blog_id);
          globalThis.__GHL_SELECTED_BLOG_ID__ = data.blog_id;
        }
      } catch (err) {
        setError('Failed to load saved blog settings.');
      }
    }
    if (locationId) fetchSettings();
  }, [locationId]);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const res = await fetch(`https://services.leadconnectorhq.com/v2/blogs?location_id=${locationId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setBlogs(data.blogs || []);

        // Automatically install menu link on first load
        await fetch('/api/install-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location_id: locationId,
            access_token: accessToken,
            name: 'Blog Selector',
            url: `https://your-vercel-app.vercel.app/blog-selector?location_id=${locationId}&access_token=${accessToken}`
          })
        });
      } catch (err) {
        setError('Failed to load blog list.');
      } finally {
        setLoading(false);
      }
    }
    if (locationId && accessToken) fetchBlogs();
  }, [locationId, accessToken]);

  async function handleSave() {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: locationId, blog_id: selectedBlogId })
      });
      if (res.ok) {
        localStorage.setItem('selected_blog_id', selectedBlogId);
        globalThis.__GHL_SELECTED_BLOG_ID__ = selectedBlogId;
        setSuccess(true);
      } else setError('Failed to save blog selection.');
    } catch (err) {
      setError('Failed to save blog selection.');
    }
  }

  useEffect(() => {
    const storedId = localStorage.getItem('selected_blog_id');
    if (storedId) {
      setSelectedBlogId(storedId);
      globalThis.__GHL_SELECTED_BLOG_ID__ = storedId;
    }
  }, []);

  // Automatically set the blog ID for publishing
  useEffect(() => {
    if (selectedBlogId) {
      globalThis.__GHL_SELECTED_BLOG_ID__ = selectedBlogId;
    }
  }, [selectedBlogId]);

  return (
    <Card className="max-w-md mx-auto mt-8 p-4">
      <CardContent>
        <Label>Select a blog to auto-post to:</Label>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {loading ? (
          <p className="mt-2">Loading blogs...</p>
        ) : (
          <Select value={selectedBlogId || ''} onValueChange={(value) => {
            setSelectedBlogId(value);
            globalThis.__GHL_SELECTED_BLOG_ID__ = value;
          }}>
            <SelectTrigger className="w-full mt-2 mb-4">
              <SelectValue placeholder="Select blog..." />
            </SelectTrigger>
            <SelectContent>
              {blogs.map((blog) => (
                <SelectItem key={blog.id} value={blog.id}>{blog.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={handleSave} disabled={!selectedBlogId}>Save</Button>
        {success && <p className="text-green-600 mt-2">Blog saved successfully!</p>}
      </CardContent>
    </Card>
  );
}
