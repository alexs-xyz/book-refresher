import { readFileSync } from 'node:fs';

import { defineManifest } from '@crxjs/vite-plugin';

const extensionPackageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

export default defineManifest({
  manifest_version: 3,
  name: 'Book Refresher',
  version: extensionPackageJson.version,
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
