// GHL Blog Selector Settings Page with Auto Menu Link Install + Feedback + Redirect + Spinner + Style Enhancements
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function GhlBlogSelector() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

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
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: locationId, blog_id: selectedBlogId })
      });
      if (res.ok) {
        localStorage.setItem('selected_blog_id', selectedBlogId);
        globalThis.__GHL_SELECTED_BLOG_ID__ = selectedBlogId;
        setSuccess(true);

        setTimeout(() => {
          router.push(`https://app.gohighlevel.com/locations/${locationId}/marketing/blogs`);
        }, 1500);
      } else setError('Failed to save blog selection.');
    } catch (err) {
      setError('Failed to save blog selection.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const storedId = localStorage.getItem('selected_blog_id');
    if (storedId) {
      setSelectedBlogId(storedId);
      globalThis.__GHL_SELECTED_BLOG_ID__ = storedId;
    }
  }, []);

  useEffect(() => {
    if (selectedBlogId) {
      globalThis.__GHL_SELECTED_BLOG_ID__ = selectedBlogId;
    }
  }, [selectedBlogId]);

  return (
    <Card className="max-w-md mx-auto mt-12 p-6 shadow-xl rounded-2xl">
      <CardContent>
        <Label className="block text-lg font-medium mb-2">Select a blog to auto-post to:</Label>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4">
            <Loader2 className="animate-spin" size={20} /> <span>Loading blogs...</span>
          </div>
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
        <Button onClick={handleSave} disabled={!selectedBlogId || saving} className="w-full">
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {saving ? 'Saving...' : 'Save'}
        </Button>
        {success && <p className="text-green-600 mt-3 text-sm">Blog saved successfully! Redirecting...</p>}
      </CardContent>
    </Card>
  );
}
