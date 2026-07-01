export function HelperText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-fg-muted px-0.5 text-xs">{children}</p>;
}
