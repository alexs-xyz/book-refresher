import type { RefresherResponse } from '@book-refresher/shared-types';

import type { PopupState } from './types';

function SummaryBlock({ response }: { response: RefresherResponse }) {
  if (response.status === 'error') {
    return <p>{response.error.message}</p>;
  }

  if (response.mode === 'lowConfidence') {
    return <p>{response.data.message}</p>;
  }

  if (response.mode === 'ambiguous') {
    return (
      <div>
        <p>Select the intended character:</p>
        <ul>
          {response.data.choices.map((choice) => (
            <li key={choice.id}>{choice.label}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <strong>{response.data.resolvedName}</strong>
      <p>{response.data.summaryParagraph}</p>
      <ul>
        {response.data.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

export function BookRefresherPopup({ state }: { state: PopupState }) {
  if (state.mode === 'hidden') {
    return null;
  }

  return (
    <div className="popup">
      <div className="row">
        <strong>Book Refresher</strong>
        <span className="badge">{state.mode}</span>
      </div>
      {state.mode === 'loading' ? (
        <p>Generating refresher…</p>
      ) : state.response ? (
        <SummaryBlock response={state.response} />
      ) : (
        <p>{state.message ?? 'No content yet.'}</p>
      )}
    </div>
  );
}
