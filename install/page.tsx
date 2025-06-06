// /app/install/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get('location_id');
    const accessToken = params.get('access_token');

    if (locationId && accessToken) {
      router.push(`/blog-selector?location_id=${locationId}&access_token=${accessToken}`);
    }
  }, [router]);

  return <p>Redirecting to blog selector...</p>;
}
