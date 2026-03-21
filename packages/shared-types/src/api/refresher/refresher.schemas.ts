import { z } from 'zod';

import { publicErrorSchema } from '../../common/error.schemas';
import { apiStatusValues, refresherModeValues } from './refresher.enums';

export const apiStatusSchema = z.enum(apiStatusValues);
export const refresherModeSchema = z.enum(refresherModeValues);

export const candidateChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1).optional()
});

export const documentMetaSchema = z.object({
  fileName: z.string().min(1).optional(),
  pageCount: z.number().int().positive().optional()
});

export const refresherRequestSchema = z.object({
  requestId: z.string().min(1),
  documentId: z.string().min(1),
  selectedText: z.string().min(1),
  selectedPage: z.number().int().positive(),
  localContext: z.string().min(1),
  prefixText: z.string().min(1),
  chosenCandidateId: z.string().min(1).nullable().optional(),
  documentMeta: documentMetaSchema.optional()
});

export const refresherNormalDataSchema = z.object({
  resolvedName: z.string().min(1),
  summaryParagraph: z.string().min(1),
  bullets: z.array(z.string().min(1)),
  relatedEntities: z.array(z.string().min(1)),
  pageReferences: z.array(z.number().int().positive())
});

export const refresherSparseDataSchema = refresherNormalDataSchema;

export const refresherAmbiguousDataSchema = z.object({
  selectedText: z.string().min(1),
  choices: z.array(candidateChoiceSchema).min(1)
});

export const refresherLowConfidenceDataSchema = z.object({
  message: z.string().min(1)
});

export const refresherNormalEnvelopeSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal('ok'),
  mode: z.literal('normal'),
  data: refresherNormalDataSchema,
  error: z.null()
});

export const refresherSparseEnvelopeSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal('ok'),
  mode: z.literal('sparse'),
  data: refresherSparseDataSchema,
  error: z.null()
});

export const refresherAmbiguousEnvelopeSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal('ok'),
  mode: z.literal('ambiguous'),
  data: refresherAmbiguousDataSchema,
  error: z.null()
});

export const refresherLowConfidenceEnvelopeSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal('ok'),
  mode: z.literal('lowConfidence'),
  data: refresherLowConfidenceDataSchema,
  error: z.null()
});

export const refresherErrorEnvelopeSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal('error'),
  mode: z.null(),
  data: z.null(),
  error: publicErrorSchema
});

export const refresherResponseSchema = z.union([
  refresherNormalEnvelopeSchema,
  refresherSparseEnvelopeSchema,
  refresherAmbiguousEnvelopeSchema,
  refresherLowConfidenceEnvelopeSchema,
  refresherErrorEnvelopeSchema
]);
