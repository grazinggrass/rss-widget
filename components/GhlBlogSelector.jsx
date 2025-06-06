import React, { useState, useEffect } from 'react';

export default function GhlBlogSelector({ locationId, accessToken }) {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    if (!locationId || !accessToken) return;

    const fetchBlogs = async () => {
      try {
        const response = await fetch(`/api/install-menu?location_id=${locationId}&access_token=${accessToken}`);
        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, [locationId, accessToken]);

  return (
    <div>
      <h1>Select a Blog</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>{blog.name}</li>
        ))}
      </ul>
    </div>
  );
}
