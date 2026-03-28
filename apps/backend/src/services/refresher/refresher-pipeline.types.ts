import type {
  RefresherAmbiguousData,
  RefresherLowConfidenceData,
  RefresherNormalData,
  RefresherRequest,
  RefresherSparseData
} from '@book-refresher/shared-types';

export type ValidatedRefresherRequest = RefresherRequest & {
  normalizedSelectedText: string;
  trimmedLocalContext: string;
  trimmedPrefixText: string;
  prefixLength: number;
};

export type RefresherPipelineResult =
  | {
      mode: 'normal';
      data: RefresherNormalData;
    }
  | {
      mode: 'sparse';
      data: RefresherSparseData;
    }
  | {
      mode: 'ambiguous';
      data: RefresherAmbiguousData;
    }
  | {
      mode: 'lowConfidence';
      data: RefresherLowConfidenceData;
    };
