import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { Dealer, DealerPayload } from '../model/types';

export const addTagTypes = ['dealer'] as const;

export const dealerApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<Dealer, DealerPayload>(build, {
        basePath: '/dealers',
        tagType: 'dealer',
      });
      return {
        getDealers: crud.getList,
        getOneDealer: crud.getOne,
        createDealer: crud.create,
        updateDealer: crud.update,
        deleteDealer: crud.remove,
      };
    },
  });

export const {
  useGetDealersQuery,
  useLazyGetDealersQuery,
  useGetOneDealerQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
  useDeleteDealerMutation,
} = dealerApiHooks;
