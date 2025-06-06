export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { location_id, access_token, name, url } = req.body;

  if (!location_id || !access_token || !name || !url) {
    return res.status(400).json({ status: 'error', message: 'Missing parameters' });
  }

  const base = 'https://services.leadconnectorhq.com/v2/locations';
  const menuUrl = `${base}/${location_id}/custom-menus`;

  try {
    // Step 1: Check if menu already exists
    const getRes = await fetch(menuUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const existing = await getRes.json();

    const alreadyInstalled = existing?.menus?.some((m) => m.url === url || m.name === name);
    if (alreadyInstalled) {
      return res.status(200).json({ status: 'ok', message: 'Menu already installed' });
    }

    // Step 2: Create menu if not found
    const postRes = await fetch(menuUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        url,
        category: 'Custom Links'
      })
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      return res.status(500).json({ status: 'error', message: err });
    }

    return res.status(200).json({ status: 'ok', message: 'Menu installed' });
  } catch (err) {
    console.error('Install menu failed:', err);
    return res.status(500).json({ status: 'error', message: 'Unexpected error' });
  }
}
