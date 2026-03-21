import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Book Refresher',
  version: '0.1.0',
  description: 'Custom PDF.js-based reader with spoiler-safe character refreshers.',
  action: {
    default_title: 'Open Book Refresher Reader'
  },
  background: {
    service_worker: 'src/extension/service-worker/index.ts',
    type: 'module'
  },
  permissions: ['storage', 'contextMenus'],
  host_permissions: ['http://localhost:8787/*'],
  web_accessible_resources: [
    {
      resources: ['reader.html', 'assets/*'],
      matches: ['<all_urls>']
    }
  ]
});
