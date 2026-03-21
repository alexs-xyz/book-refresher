import { SelectionStateBuilder } from './SelectionStateBuilder';
import { SelectionValidator } from './SelectionValidator';
import type { SelectionState } from './types';

export class SelectionController {
  private readonly builder = new SelectionStateBuilder();
  private readonly validator = new SelectionValidator();

  getCurrentSelection(): SelectionState {
    return this.validator.validate(this.builder.scaffold());
  }
}
