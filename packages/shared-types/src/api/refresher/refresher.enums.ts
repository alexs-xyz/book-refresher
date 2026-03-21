export const refresherModeValues = ['normal', 'sparse', 'ambiguous', 'lowConfidence'] as const;
export type RefresherMode = (typeof refresherModeValues)[number];

export const apiStatusValues = ['ok', 'error'] as const;
export type ApiStatus = (typeof apiStatusValues)[number];
