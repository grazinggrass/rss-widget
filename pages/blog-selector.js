import dynamic from 'next/dynamic';

const GhlBlogSelector = dynamic(() => import('../components/GhlBlogSelector'), { ssr: false });

export default function BlogSelectorPage() {
  return <GhlBlogSelector />;
}
