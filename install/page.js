// app/install/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const locationId = params.get('location_id');

    if (accessToken && locationId) {
      const redirectUrl = `https://widgets.grazinggrass.com/blog-selector?access_token=${accessToken}&location_id=${locationId}`;
      window.location.href = redirectUrl;
    }
  }, []);

  return <p className="text-center mt-10">Redirecting to blog selector...</p>;
}
