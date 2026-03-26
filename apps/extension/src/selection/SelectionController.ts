import { SelectionStateBuilder } from './SelectionStateBuilder';
import { SelectionValidator } from './SelectionValidator';
import { createEmptySelectionState, type SelectionState } from './types';

export type SelectionControllerOptions = {
  ownerDocument: Document;
  root: HTMLElement;
};

export type SelectionStateListener = (selection: SelectionState) => void;

export class SelectionController {
  private readonly builder = new SelectionStateBuilder();
  private readonly validator: SelectionValidator;
  private readonly listeners = new Set<SelectionStateListener>();
  private currentSelection = createEmptySelectionState();
  private isStarted = false;

  private readonly handleSelectionChange = () => {
    this.refresh();
  };

  constructor(private readonly options: SelectionControllerOptions) {
    this.validator = new SelectionValidator(options.root);
  }

  start(): void {
    if (this.isStarted) {
      return;
    }

    this.isStarted = true;
    this.options.ownerDocument.addEventListener('selectionchange', this.handleSelectionChange);
    this.refresh();
  }

  destroy(): void {
    if (this.isStarted) {
      this.options.ownerDocument.removeEventListener('selectionchange', this.handleSelectionChange);
      this.isStarted = false;
    }

    this.listeners.clear();
    this.currentSelection = createEmptySelectionState();
  }

  subscribe(listener: SelectionStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSelection);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentSelection(): SelectionState {
    return this.currentSelection;
  }

  refresh(): SelectionState {
    const nextSelection = this.validator.validate(
      this.builder.build(this.options.ownerDocument.getSelection())
    );

    this.currentSelection = nextSelection;

    for (const listener of this.listeners) {
      listener(nextSelection);
    }

    return nextSelection;
  }
}
