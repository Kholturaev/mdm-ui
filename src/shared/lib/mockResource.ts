import { useCallback, useEffect, useState } from 'react';
import type { IMeta, IRequestList, IResponse } from '@shared/api/type';

const MOCK_DELAY_MS = 300;

export function wait(ms: number = MOCK_DELAY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

type MockResourceConfig<T, TForm> = {
  seed: T[];
  getId: (item: T) => number;
  /** Builds the stored entity from a form submission — `existing` is set on update, null on create. */
  applyForm: (form: TForm, existing: T | null, nextId: number) => T;
  /** Free-text search predicate, used when `filters.search` is present in a list request. */
  matchesSearch?: (item: T, query: string) => boolean;
  /** Extra structured filters beyond `search` — e.g. `{ roleId: 2 }` — applied in addition to the search predicate. */
  matchesFilters?: (item: T, filters: Record<string, unknown>) => boolean;
};

function paginate<T>(items: T[], params: IRequestList): IResponse<IMeta<T[]>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const start = page * size;
  const pageItems = items.slice(start, start + size);
  return {
    status: 200,
    headers: {},
    data: {
      data: pageItems,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: [],
        offset: start,
        paged: true,
        unpaged: false,
      },
      totalPages: Math.max(1, Math.ceil(items.length / size)),
      totalElements: items.length,
      last: start + size >= items.length,
      size,
      number: page,
      sort: [],
      numberOfElements: pageItems.length,
      first: page === 0,
      empty: pageItems.length === 0,
      currentPage: page,
    },
  };
}

/**
 * In-memory stand-in for `buildCrudEndpoints` — same request shape
 * (`IRequestList`) and response shape (`IResponse<IMeta<T[]>>` /
 * `IResponse<T>`) as the real RTK Query CRUD factory, and mutation hooks
 * return the same `[trigger, { isLoading }]` + `.unwrap()` shape. Lets
 * tables/forms/pages be written identically to ones backed by a real
 * endpoint, so swapping this out later touches only the entity's api file.
 */
export function createMockResource<T extends object, TForm>(
  config: MockResourceConfig<T, TForm>,
) {
  let store = [...config.seed];
  let nextId =
    store.reduce((max, item) => Math.max(max, config.getId(item)), 0) + 1;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  function useStoreVersion() {
    const [, setVersion] = useState(0);
    useEffect(() => {
      const listener = () => setVersion((v) => v + 1);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);
  }

  function useList(params: IRequestList) {
    useStoreVersion();
    const [isFetching, setIsFetching] = useState(true);
    const [data, setData] = useState<IResponse<IMeta<T[]>>>();
    const paramsKey = JSON.stringify(params);

    useEffect(() => {
      let cancelled = false;
      setIsFetching(true);
      wait(MOCK_DELAY_MS).then(() => {
        if (cancelled) return;
        let items = [...store];
        const search = params.filters?.search;
        if (
          typeof search === 'string' &&
          search.trim() &&
          config.matchesSearch
        ) {
          const query = search.trim().toLowerCase();
          items = items.filter((item) => config.matchesSearch!(item, query));
        }
        const otherFilters = params.filters
          ? Object.fromEntries(
              Object.entries(params.filters).filter(
                ([key]) => key !== 'search',
              ),
            )
          : {};
        if (Object.keys(otherFilters).length > 0 && config.matchesFilters) {
          items = items.filter((item) =>
            config.matchesFilters!(item, otherFilters),
          );
        }
        if (params.sortField) {
          const field = params.sortField;
          items.sort((a, b) => {
            const av = String((a as Record<string, unknown>)[field] ?? '');
            const bv = String((b as Record<string, unknown>)[field] ?? '');
            const cmp = av.localeCompare(bv);
            return params.sortDirection === 'desc' ? -cmp : cmp;
          });
        }
        setData(paginate(items, params));
        setIsFetching(false);
      });
      return () => {
        cancelled = true;
      };
      // paramsKey captures every field of `params` used above
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);

    const refetch = useCallback(() => notify(), []);
    return { data, isFetching, isLoading: isFetching && !data, refetch };
  }

  function useGetOne(id: number | string | null) {
    useStoreVersion();
    const [isFetching, setIsFetching] = useState(true);
    const [data, setData] = useState<IResponse<T>>();

    useEffect(() => {
      if (id == null) {
        setIsFetching(false);
        return;
      }
      let cancelled = false;
      setIsFetching(true);
      wait(MOCK_DELAY_MS).then(() => {
        if (cancelled) return;
        const found = store.find((item) => config.getId(item) === Number(id));
        setData(found ? { status: 200, data: found, headers: {} } : undefined);
        setIsFetching(false);
      });
      return () => {
        cancelled = true;
      };
    }, [id]);

    return { data, isFetching, isLoading: isFetching && !data };
  }

  function useCreate() {
    const [isLoading, setIsLoading] = useState(false);
    const trigger = useCallback((form: TForm) => {
      setIsLoading(true);
      const promise = wait(MOCK_DELAY_MS).then(() => {
        const entity = config.applyForm(form, null, nextId++);
        store = [entity, ...store];
        notify();
        setIsLoading(false);
        return { status: 200, data: entity, headers: {} } as IResponse<T>;
      });
      return { unwrap: () => promise.then((response) => response.data) };
    }, []);
    return [trigger, { isLoading }] as const;
  }

  function useUpdate() {
    const [isLoading, setIsLoading] = useState(false);
    const trigger = useCallback((args: { id: number; data: TForm }) => {
      setIsLoading(true);
      const promise = wait(MOCK_DELAY_MS).then(() => {
        const existing =
          store.find((item) => config.getId(item) === args.id) ?? null;
        const updated = config.applyForm(args.data, existing, args.id);
        store = store.map((item) =>
          config.getId(item) === args.id ? updated : item,
        );
        notify();
        setIsLoading(false);
        return { status: 200, data: updated, headers: {} } as IResponse<T>;
      });
      return { unwrap: () => promise.then((response) => response.data) };
    }, []);
    return [trigger, { isLoading }] as const;
  }

  function useRemove() {
    const [isLoading, setIsLoading] = useState(false);
    const trigger = useCallback((id: number) => {
      setIsLoading(true);
      const promise = wait(MOCK_DELAY_MS).then(() => {
        store = store.filter((item) => config.getId(item) !== id);
        notify();
        setIsLoading(false);
        return { status: 200, data: undefined, headers: {} } as IResponse<void>;
      });
      return { unwrap: () => promise.then((response) => response.data) };
    }, []);
    return [trigger, { isLoading }] as const;
  }

  /** Direct store mutation for actions that don't fit plain create/update/remove — e.g. assigning roles or permissions. Notifies subscribers same as the CRUD mutations. */
  function mutateStore(updater: (items: T[]) => T[]) {
    store = updater(store);
    notify();
  }

  function getSnapshot() {
    return store;
  }

  return {
    useList,
    useGetOne,
    useCreate,
    useUpdate,
    useRemove,
    mutateStore,
    getSnapshot,
    useStoreVersion,
  };
}
