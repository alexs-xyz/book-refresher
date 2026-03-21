import type { CSSProperties } from 'react';

export class PopupAnchorManager {
  getDefaultStyle(): CSSProperties {
    return {
      position: 'fixed',
      right: 24,
      bottom: 24
    };
  }
}
