import type { RefresherResponse } from '@book-refresher/shared-types';

import type { RefresherPipelineResult } from './refresher-pipeline.types';

export class RefresherResponseMapper {
  map(requestId: string, result: RefresherPipelineResult): RefresherResponse {
    switch (result.mode) {
      case 'normal':
        return {
          requestId,
          status: 'ok',
          mode: 'normal',
          data: result.data,
          error: null
        };
      case 'sparse':
        return {
          requestId,
          status: 'ok',
          mode: 'sparse',
          data: result.data,
          error: null
        };
      case 'ambiguous':
        return {
          requestId,
          status: 'ok',
          mode: 'ambiguous',
          data: result.data,
          error: null
        };
      case 'lowConfidence':
        return {
          requestId,
          status: 'ok',
          mode: 'lowConfidence',
          data: result.data,
          error: null
        };
    }
  }
}
