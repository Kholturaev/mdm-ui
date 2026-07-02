import type { ReactNode } from 'react';

type HighlightMatchProps = {
  text: string;
  /** Every case-insensitive occurrence of this substring gets wrapped in a highlight. No-op when empty. */
  query?: string;
};

/** Wraps every occurrence of `query` inside `text` in a highlighted `<mark>` — for showing why a row matched a search. */
export function HighlightMatch({ text, query }: HighlightMatchProps) {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();

  let cursor = 0;
  let matchIndex = lowerText.indexOf(lowerQuery, cursor);
  if (matchIndex === -1) return <>{text}</>;

  const parts: ReactNode[] = [];
  let key = 0;
  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex));
    parts.push(
      <mark
        key={key++}
        className="bg-primary/25 text-fg rounded-sm px-0.5 font-semibold"
      >
        {text.slice(matchIndex, matchIndex + trimmedQuery.length)}
      </mark>,
    );
    cursor = matchIndex + trimmedQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
