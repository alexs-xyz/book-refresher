import type {
  RefresherAmbiguousData,
  RefresherRequest,
  RefresherResponse
} from '@book-refresher/shared-types';

export class RefresherService {
  async run(request: RefresherRequest): Promise<RefresherResponse> {
    const normalizedSelection = request.selectedText.trim();
    const prefixLength = request.prefixText.trim().length;

    if (request.chosenCandidateId) {
      return {
        requestId: request.requestId,
        status: 'ok',
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
        },
        error: null
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
        requestId: request.requestId,
        status: 'ok',
        mode: 'ambiguous',
        data,
        error: null
      };
    }

    if (normalizedSelection.split(/\s+/).length > 3) {
      return {
        requestId: request.requestId,
        status: 'ok',
        mode: 'lowConfidence',
        data: {
          message:
            'The scaffold could not confidently treat this selection as a character. Replace this rule with the real candidate-resolution stage.'
        },
        error: null
      };
    }

    if (prefixLength < 800) {
      return {
        requestId: request.requestId,
        status: 'ok',
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
        },
        error: null
      };
    }

    return {
      requestId: request.requestId,
      status: 'ok',
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
      },
      error: null
    };
  }
}
