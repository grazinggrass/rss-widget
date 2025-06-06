// app/blog-selector/page.tsx
'use client';
import { useEffect } from 'react';
import { init } from '@highleveldev/widget-sdk';
import dynamic from 'next/dynamic';

const GhlBlogSelector = dynamic(() => import('@/components/GhlBlogSelector'), { ssr: false });

export default function BlogSelectorPage() {
  useEffect(() => {
    init(); // Initializes GHL context and injects locationId, etc.
  }, []);

  return <GhlBlogSelector />;
}

