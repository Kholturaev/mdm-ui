import { apiService } from '@shared/api';
import type { ApiException, IResponse } from '@shared/api/type';
import type { AuditRecordFieldEntry, SpringPage } from '../model/types';

interface AuditByRecordParams {
  tableName: string;
  recordId: number | string;
  page?: number;
  size?: number;
}

function emptyPage(
  page: number,
  size: number,
): SpringPage<AuditRecordFieldEntry> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size,
    number: page,
    first: true,
    last: true,
    empty: true,
  };
}

/** Real backend audit history, scoped to one record — `POST /audit/info/by-record` with `{ page, size, filters: { tableName, recordId } }`, returning a raw Spring `Page<T>` of per-field rows (see `AuditRecordFieldEntry`). */
export const auditRecordApiHooks = apiService
  .enhanceEndpoints({ addTagTypes: ['auditRecord'] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAuditByRecord: build.query<
        IResponse<SpringPage<AuditRecordFieldEntry>>,
        AuditByRecordParams
      >({
        queryFn: async (
          { tableName, recordId, page = 0, size = 200 },
          _queryApi,
          _extraOptions,
          baseQuery,
        ) => {
          const result = await baseQuery({
            path: '/audit/info/by-record',
            method: 'POST',
            body: { page, size, filters: { tableName, recordId } },
          });

          if (result.error) {
            const err = result.error as ApiException;
            // A record with no history yet may 404 depending on backend — treat as an empty page rather than an error state.
            if (err.status === 404) {
              return {
                data: {
                  status: 200,
                  headers: {},
                  data: emptyPage(page, size),
                },
              };
            }
            return { error: err };
          }

          return {
            data: result.data as IResponse<SpringPage<AuditRecordFieldEntry>>,
          };
        },
        providesTags: ['auditRecord'],
      }),
    }),
  });

export const { useGetAuditByRecordQuery } = auditRecordApiHooks;
