importScripts('https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.bundle.js');
importScripts('/uv.config.js');
importScripts('https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
    event.respondWith(sw.fetch(event));
});
