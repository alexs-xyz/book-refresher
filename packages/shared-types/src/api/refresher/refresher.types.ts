import type { z } from 'zod';

import type { ApiEnvelope } from '../../common/result.types';
import {
  candidateChoiceSchema,
  refresherAmbiguousDataSchema,
  refresherErrorEnvelopeSchema,
  refresherLowConfidenceDataSchema,
  refresherNormalDataSchema,
  refresherRequestSchema,
  refresherResponseSchema,
  refresherSparseDataSchema
} from './refresher.schemas';
import type { RefresherMode } from './refresher.enums';

export type CandidateChoice = z.infer<typeof candidateChoiceSchema>;
export type RefresherRequest = z.infer<typeof refresherRequestSchema>;
export type RefresherNormalData = z.infer<typeof refresherNormalDataSchema>;
export type RefresherSparseData = z.infer<typeof refresherSparseDataSchema>;
export type RefresherAmbiguousData = z.infer<typeof refresherAmbiguousDataSchema>;
export type RefresherLowConfidenceData = z.infer<typeof refresherLowConfidenceDataSchema>;
export type RefresherErrorEnvelope = z.infer<typeof refresherErrorEnvelopeSchema>;
export type RefresherResponse = z.infer<typeof refresherResponseSchema>;

export type RefresherSuccessData =
  | RefresherNormalData
  | RefresherSparseData
  | RefresherAmbiguousData
  | RefresherLowConfidenceData;

export type RefresherEnvelope<TData> = ApiEnvelope<TData, RefresherMode>;
