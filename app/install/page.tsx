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
      router.push(`/blog-selector?access_token=${accessToken}&location_id=${locationId}`);
    }
  }, []);

  return <p className="text-center mt-10">Redirecting to blog selector...</p>;
}
