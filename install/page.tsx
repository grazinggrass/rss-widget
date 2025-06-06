// /app/install/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const locationId = params.get('location_id');

    if (accessToken && locationId) {
      router.push(`/blog-selector?location_id=${locationId}&access_token=${accessToken}`);
    }
  }, []);

  return <p className="text-center mt-20 text-gray-600">Setting up your app...</p>;
}
