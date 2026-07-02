import { HighlightMatch } from '@shared/ui';

type TextCellProps = {
  value?: string | null;
  query?: string;
};

export function TextCell({ value, query }: TextCellProps) {
  if (!value) return '—';
  return <HighlightMatch text={value} query={query} />;
}
