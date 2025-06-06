// app/blog-selector/page.tsx
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GhlBlogSelector = dynamic(() => import('@/components/GhlBlogSelector'), { ssr: false });

export default function BlogSelectorPage() {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLocationId(params.get('location_id'));
    setAccessToken(params.get('access_token'));
  }, []);

  if (!locationId || !accessToken) {
    return <p>Missing required parameters.</p>;
  }

  return <GhlBlogSelector locationId={locationId} accessToken={accessToken} />;
}
