import type { RefresherAmbiguousData } from '@book-refresher/shared-types';

import type {
  RefresherPipelineResult,
  ValidatedRefresherRequest
} from './refresher-pipeline.types';

export class RefresherService {
  async run(request: ValidatedRefresherRequest): Promise<RefresherPipelineResult> {
    const normalizedSelection = request.normalizedSelectedText;
    const prefixLength = request.prefixLength;

    if (request.chosenCandidateId) {
      return {
        mode: 'normal',
        data: {
          resolvedName: normalizedSelection,
          summaryParagraph:
            'Scaffold response after candidate choice. Replace this with the real evidence-driven refresher pipeline.',
          bullets: [
            'The ambiguity follow-up path is wired.',
            'The backend contract is already stable.',
            'Replace this deterministic response in Milestone 4.'
          ],
          relatedEntities: [],
          pageReferences: [Math.max(1, request.selectedPage - 1), request.selectedPage]
        }
      };
    }

    if (['tom', 'john', 'mary'].includes(normalizedSelection.toLowerCase())) {
      const data: RefresherAmbiguousData = {
        selectedText: normalizedSelection,
        choices: [
          { id: 'cand_main', label: `${normalizedSelection} (main character)` },
          { id: 'cand_minor', label: `${normalizedSelection} (minor character)` }
        ]
      };

      return {
        mode: 'ambiguous',
        data
      };
    }

    if (normalizedSelection.split(/\s+/).length > 3) {
      return {
        mode: 'lowConfidence',
        data: {
          message:
            'The scaffold could not confidently treat this selection as a character. Replace this rule with the real candidate-resolution stage.'
        }
      };
    }

    if (prefixLength < 800) {
      return {
        mode: 'sparse',
        data: {
          resolvedName: normalizedSelection,
          summaryParagraph:
            'This character has only limited earlier evidence so far in the current scaffold implementation.',
          bullets: [
            'The sparse mode wiring is working.',
            'The frontend can branch on a real response mode.',
            'Replace this with evidence-volume thresholds later.'
          ],
          relatedEntities: [],
          pageReferences: [request.selectedPage]
        }
      };
    }

    return {
      mode: 'normal',
      data: {
        resolvedName: normalizedSelection,
        summaryParagraph:
          'This is a deterministic scaffold response. The transport, schemas, and mode handling are real; the retrieval/generation pipeline is still to be implemented.',
        bullets: [
          'Request validation is live.',
          'The shared contract is live.',
          'This mode should later be backed by retrieved evidence blocks.'
        ],
        relatedEntities: ['Placeholder Related Entity'],
        pageReferences: [Math.max(1, request.selectedPage - 2), request.selectedPage]
      }
    };
  }
}
