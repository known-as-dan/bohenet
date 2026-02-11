/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;

/** All app assets (JS/CSS bundles + static files like favicon, template.xlsx) */
const ASSETS = [...build, ...files];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE_NAME) await caches.delete(key);
			}
			await sw.clients.claim();
		})
	);
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Skip cross-origin requests except Google Fonts
	const isFont =
		url.origin === 'https://fonts.googleapis.com' ||
		url.origin === 'https://fonts.gstatic.com';

	if (url.origin !== sw.location.origin && !isFont) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);

			// For precached assets — cache-first
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
			}

			try {
				const response = await fetch(event.request);
				// Cache successful responses (fonts, navigations, etc.)
				if (response.ok && response.status === 200) {
					cache.put(event.request, response.clone());
				}
				return response;
			} catch {
				// Offline fallback — serve from cache
				const cached = await cache.match(event.request);
				if (cached) return cached;

				// For navigation requests, serve the app shell
				if (event.request.mode === 'navigate') {
					const shell = await cache.match('/');
					if (shell) return shell;
				}

				return new Response('Offline', { status: 503 });
			}
		})()
	);
});
