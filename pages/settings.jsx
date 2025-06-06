// GHL Blog Selector Settings Page
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
  const locationId = new URLSearchParams(window.location.search).get('location_id');
  const accessToken = new URLSearchParams(window.location.search).get('access_token');

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch(`/api/settings?location_id=${locationId}`);
      const data = await res.json();
      if (data.blog_id) setSelectedBlogId(data.blog_id);
    }
    fetchSettings();
  }, [locationId]);

  useEffect(() => {
    async function fetchBlogs() {
      const res = await fetch(`https://services.leadconnectorhq.com/v2/blogs?location_id=${locationId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setBlogs(data.blogs || []);
    }
    if (locationId && accessToken) fetchBlogs();
  }, [locationId, accessToken]);

  async function handleSave() {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: locationId, blog_id: selectedBlogId })
    });
    if (res.ok) setSuccess(true);
  }

  return (
    <Card className="max-w-md mx-auto mt-8 p-4">
      <CardContent>
        <Label>Select a blog to auto-post to:</Label>
        <Select value={selectedBlogId || ''} onValueChange={setSelectedBlogId}>
          <SelectTrigger className="w-full mt-2 mb-4">
            <SelectValue placeholder="Select blog..." />
          </SelectTrigger>
          <SelectContent>
            {blogs.map((blog) => (
              <SelectItem key={blog.id} value={blog.id}>{blog.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSave} disabled={!selectedBlogId}>Save</Button>
        {success && <p className="text-green-600 mt-2">Blog saved successfully!</p>}
      </CardContent>
    </Card>
  );
}
