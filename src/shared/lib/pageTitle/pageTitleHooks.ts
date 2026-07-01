import { useContext, useEffect } from 'react';
import { PageTitleContext } from './context';

function usePageTitleContext() {
  const ctx = useContext(PageTitleContext);
  if (!ctx)
    throw new Error(
      'usePageTitleContext must be used within a PageTitleProvider',
    );
  return ctx;
}

/** Call from any page to put its title in the app header instead of rendering an `<h1>` in the body. */
export function usePageTitle(title: string) {
  const { setTitle } = usePageTitleContext();
  useEffect(() => setTitle(title), [title, setTitle]);
}

export function usePageTitleValue() {
  return usePageTitleContext().title;
}
