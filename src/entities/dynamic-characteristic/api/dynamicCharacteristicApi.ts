import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  CreateDynamicCharacteristicTablePayload,
  CreateOrUpdateDynamicCharacteristicColumnPayload,
  CreateOrUpdateDynamicCharacteristicRowPayload,
  IDynamicCharacteristicColumn,
  IDynamicCharacteristicRow,
  IDynamicCharacteristicTable,
  ReorderDynamicCharacteristicColumnsPayload,
} from '../model/types';

export const addTagTypes = [
  'dynamic-characteristic',
  'characteristic-group',
] as const;

/**
 * Dynamic characteristic tables/columns/rows are never fetched standalone —
 * like `characteristic`, they're always read embedded off
 * `getCharacteristicGroupsByNomenclature` (`group.dynamicTables`), tagged
 * `characteristic-group`. So every mutation here invalidates BOTH tags: its
 * own, plus `characteristic-group` so that embedded list refreshes too.
 */
export const dynamicCharacteristicApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      createDynamicCharacteristicTable: build.mutation<
        IResponse<IDynamicCharacteristicTable>,
        CreateDynamicCharacteristicTablePayload
      >({
        query: (data) => ({
          path: '/dynamic-characteristics_table/table-create',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),

      deleteDynamicCharacteristicTable: build.mutation<IResponse<void>, number>(
        {
          query: (tableId) => ({
            path: `/dynamic-characteristics_table/tables/${tableId}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
        },
      ),

      createOrUpdateDynamicCharacteristicColumn: build.mutation<
        IResponse<IDynamicCharacteristicColumn>,
        CreateOrUpdateDynamicCharacteristicColumnPayload
      >({
        query: (data) => ({
          path: '/dynamic-characteristics_table/column-create',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),

      deleteDynamicCharacteristicColumn: build.mutation<
        IResponse<void>,
        number
      >({
        query: (columnId) => ({
          path: `/dynamic-characteristics_table/columns/${columnId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),

      reorderDynamicCharacteristicColumns: build.mutation<
        IResponse<void>,
        ReorderDynamicCharacteristicColumnsPayload
      >({
        query: (data) => ({
          path: '/dynamic-characteristics_table/reorder-columns',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),

      createOrUpdateDynamicCharacteristicRow: build.mutation<
        IResponse<IDynamicCharacteristicRow>,
        CreateOrUpdateDynamicCharacteristicRowPayload
      >({
        query: (data) => ({
          path: '/dynamic-characteristics_table/row-create',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),

      deleteDynamicCharacteristicRow: build.mutation<IResponse<void>, number>({
        query: (rowId) => ({
          path: `/dynamic-characteristics_table/rows/${rowId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),
    }),
  });

export const {
  useCreateDynamicCharacteristicTableMutation,
  useDeleteDynamicCharacteristicTableMutation,
  useCreateOrUpdateDynamicCharacteristicColumnMutation,
  useDeleteDynamicCharacteristicColumnMutation,
  useReorderDynamicCharacteristicColumnsMutation,
  useCreateOrUpdateDynamicCharacteristicRowMutation,
  useDeleteDynamicCharacteristicRowMutation,
} = dynamicCharacteristicApiHooks;
