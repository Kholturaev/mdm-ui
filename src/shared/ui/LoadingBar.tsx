/** Thin indeterminate progress bar — pins to the top of a `relative` container without shifting layout. */
export function LoadingBar() {
  return (
    <div className="bg-border/40 absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
      <div className="bg-primary h-full w-1/3 [animation:loading-bar_1.1s_ease-in-out_infinite]" />
    </div>
  );
}
