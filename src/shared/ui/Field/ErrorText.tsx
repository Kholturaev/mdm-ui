export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-danger px-0.5 text-xs">{children}</p>;
}
