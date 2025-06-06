// app/blog-selector/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically load the selector component to avoid SSR issues
const GhlBlogSelector = dynamic(() => import('@/components/GhlBlogSelector'), { ssr: false });

export default function BlogSelectorPage() {
  return <GhlBlogSelector />;
}
