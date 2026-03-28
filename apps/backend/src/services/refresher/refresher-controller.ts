import type { RefresherRequest, RefresherResponse } from '@book-refresher/shared-types';

import { RefresherRequestValidator } from './refresher-request-validator';
import { RefresherResponseMapper } from './refresher-response-mapper';
import { RefresherService } from './refresher-service';

export class RefresherController {
  constructor(
    private readonly requestValidator = new RefresherRequestValidator(),
    private readonly refresherService = new RefresherService(),
    private readonly responseMapper = new RefresherResponseMapper()
  ) {}

  async handle(request: RefresherRequest): Promise<RefresherResponse> {
    const validatedRequest = this.requestValidator.validate(request);
    const pipelineResult = await this.refresherService.run(validatedRequest);

    return this.responseMapper.map(validatedRequest.requestId, pipelineResult);
  }
}
