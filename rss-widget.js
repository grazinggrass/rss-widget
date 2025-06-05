/**
 * RSS Feed Widget
 * 
 * Usage:
 * 1. Include this script in your HTML page
 * 2. Add a container div: <div id="rss-feed-widget"></div>
 * 3. Add the script tag with parameters:
 *    <script src="rss-widget.js" 
 *            data-feed="https://example.com/feed.xml"
 *            data-max="5" 
 *            data-img-size="100"></script>
 * 
 * Parameters:
 * - data-feed: RSS feed URL (required)
 * - data-max: Maximum number of items to display (default: 5)
 * - data-img-size: Image size in pixels (default: 80)
 */

(function() {
    'use strict';

let config = null;

function readConfig() {
    const scripts = document.querySelectorAll('script[src*="rss-widget.js"]');
    const currentScript = scripts[scripts.length - 1];

    if (!currentScript) {
        console.error('RSS Widget: Could not find script element');
        return;
    }

    config = {
        feedUrl: currentScript.getAttribute('data-feed'),
        maxItems: parseInt(currentScript.getAttribute('data-max')) || 5,
        imageSize: parseInt(currentScript.getAttribute('data-img-size')) || 80
    };

    if (!config.feedUrl) {
        console.error('RSS Widget: data-feed attribute is required');
        return;
    }
}


    // CSS styles for the widget
    const styles = `
        .rss-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 0;
            padding: 0;
        }
        .rss-item {
            display: flex;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            gap: 12px;
        }
        .rss-item:last-child {
            border-bottom: none;
        }
        .rss-image {
            flex-shrink: 0;
            border-radius: 6px;
            object-fit: cover;
            background-color: #f3f4f6;
        }
        .rss-content {
            flex: 1;
            min-width: 0;
        }
        .rss-title {
            margin: 0 0 6px 0;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.4;
        }
        .rss-title a {
            color: #1f2937;
            text-decoration: none;
        }
        .rss-title a:hover {
            color: #3b82f6;
            text-decoration: underline;
        }
        .rss-date {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .rss-error {
            color: #dc2626;
            padding: 16px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            font-size: 14px;
        }
        .rss-loading {
            color: #6b7280;
            padding: 16px;
            text-align: center;
            font-size: 14px;
        }
    `;

    // Add styles to the page
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    // Format date for display
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Extract image URL from RSS item
    function extractImageUrl(item) {
        // Try to find image in enclosure
        const enclosure = item.querySelector('enclosure[type^="image"]');
        if (enclosure) {
            return enclosure.getAttribute('url');
        }

        // Try to find iTunes image
        const itunesImage = item.querySelector('image') || 
                           item.querySelector('itunes\\:image, image');
        if (itunesImage) {
            return itunesImage.getAttribute('href') || 
                   itunesImage.getAttribute('url') || 
                   itunesImage.textContent;
        }

        // Try to find image in description
        const description = item.querySelector('description');
        if (description) {
            const imgMatch = description.textContent.match(/<img[^>]+src="([^"]+)"/);
            if (imgMatch) {
                return imgMatch[1];
            }
        }

        return null;
    }

    // Create HTML for a single RSS item
    function createItemHTML(item, imageSize) {
        const title = item.querySelector('title')?.textContent || 'Untitled';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const imageUrl = extractImageUrl(item);

        const imageHTML = imageUrl ? 
            `<img src="${imageUrl}" alt="${title}" class="rss-image" width="${imageSize}" height="${imageSize}" onerror="this.style.display='none'">` :
            `<div class="rss-image" style="width:${imageSize}px;height:${imageSize}px;background-color:#f3f4f6;"></div>`;

        return `
            <div class="rss-item">
                ${imageHTML}
                <div class="rss-content">
                    <h3 class="rss-title">
                        <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
                    </h3>
                    <p class="rss-date">${formatDate(pubDate)}</p>
                </div>
            </div>
        `;
    }

    // Fetch and parse RSS feed
    async function fetchRSSFeed(url) {
        try {
            // Use a CORS proxy for cross-origin requests
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

            const response = await fetch(proxyUrl);
            const text = await response.text(); // ✅ get raw XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');

            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Failed to parse RSS feed');
            }

            return xmlDoc;
        } catch (error) {
            console.error('RSS Widget Error:', error);
            throw error;
        }
    }

    // Render the RSS feed widget
    async function renderWidget() {
        const container = document.getElementById('rss-feed-widget');
        if (!container) {
            console.error('RSS Widget: Container element with id "rss-feed-widget" not found');
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="rss-loading">Loading RSS feed...</div>';

        try {
            const xmlDoc = await fetchRSSFeed(config.feedUrl);
            const items = xmlDoc.querySelectorAll('item');

            if (items.length === 0) {
                container.innerHTML = '<div class="rss-error">No items found in RSS feed</div>';
                return;
            }

            // Limit items to maxItems
            const limitedItems = Array.from(items).slice(0, config.maxItems);
            
            // Generate HTML for all items
            const itemsHTML = limitedItems
                .map(item => createItemHTML(item, config.imageSize))
                .join('');

            container.innerHTML = `<div class="rss-widget">${itemsHTML}</div>`;

        } catch (error) {
            container.innerHTML = `
                <div class="rss-error">
                    Failed to load RSS feed. Please check the feed URL and try again.
                    <br><small>Error: ${error.message}</small>
                </div>
            `;
        }
    }

    // Initialize the widget when DOM is ready
    function init() {
        addStyles();
        readConfig();
        if (config) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', renderWidget);
            } else {
                renderWidget();
            }
        }
    }

    // Start the widget
    init();

})();
