import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IResponse } from '@shared/api/type';
import type {
  IExternalSystem,
  ExternalSystemFormValues,
  IIntegrationConfig,
  IIntegrationConfigListResponse,
  IntegrationConfigMutationPayload,
  ISourceSchemaNode,
  IProductCreationExample,
} from '../model/types';

/** The backend sometimes wraps a source-tree response in the usual `IResponse` envelope and sometimes returns the bare node — read it via `extractSourceNode` in `../lib/sourceTree` rather than assuming either shape. */
type SourceTreeResponse = IResponse<ISourceSchemaNode> | ISourceSchemaNode;

export const addTagTypes = ['external-system', 'integration-config'] as const;

export const externalSystemApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        IExternalSystem,
        ExternalSystemFormValues
      >(build, {
        basePath: '/external-systems',
        tagType: 'external-system',
      });
      const integrationConfigCrud = buildCrudEndpoints<
        IIntegrationConfig,
        IntegrationConfigMutationPayload
      >(build, {
        basePath: '/integration-configs',
        tagType: 'integration-config',
      });
      return {
        getExternalSystems: crud.getList,
        getOneExternalSystem: crud.getOne,
        createExternalSystem: crud.create,
        updateExternalSystem: crud.update,
        deleteExternalSystem: crud.remove,
        /** Saved export config(s) for one external system — used both for the product-create preview and as the config builder page's single source of truth (it always takes the first config, matching akfa-data-frontend's own "one config per system" behavior). */
        getIntegrationConfigsBySystem: build.query<
          IResponse<IIntegrationConfigListResponse>,
          { externalSystemId: number }
        >({
          query: ({ externalSystemId }) => ({
            path: `/integration-configs/list?externalSystemId=${externalSystemId}`,
            method: 'POST',
            body: { page: 0, size: 50 },
          }),
          providesTags: ['integration-config'],
        }),
        /** The standalone "Integration Configurations" admin list — every config across all external systems, not scoped to one. */
        getIntegrationConfigs: integrationConfigCrud.getList,
        getOneIntegrationConfig: integrationConfigCrud.getOne,
        createIntegrationConfig: integrationConfigCrud.create,
        updateIntegrationConfig: integrationConfigCrud.update,
        deleteIntegrationConfig: integrationConfigCrud.remove,

        // Source field trees for the config builder's checkbox-tree — none of
        // these take query params (the nomenclature one takes the type id as
        // a path segment), and none are tag-cached (they're static schema,
        // not data that mutations here would ever invalidate).
        getProductSourceTree: build.query<SourceTreeResponse, void>({
          query: () => ({
            path: '/integration-configs/source-tree/product',
            method: 'GET',
          }),
        }),
        getProductGroupSourceTree: build.query<SourceTreeResponse, void>({
          query: () => ({
            path: '/integration-configs/source-tree/product-groups',
            method: 'GET',
          }),
        }),
        getProductRateSourceTree: build.query<SourceTreeResponse, void>({
          query: () => ({
            path: '/integration-configs/source-tree/product-rates',
            method: 'GET',
          }),
        }),
        getDealerSourceTree: build.query<SourceTreeResponse, void>({
          query: () => ({
            path: '/integration-configs/source-tree/dealers',
            method: 'GET',
          }),
        }),
        getNomenclatureSourceTreeById: build.query<SourceTreeResponse, number>({
          query: (id) => ({
            path: `/integration-configs/source-tree/nomenclatures/${id}`,
            method: 'GET',
          }),
        }),

        /** The MDM field-dictionary schema for a nomenclature type's product-creation payload — a mutation (not a query) since it's only ever triggered on demand from a download button, not auto-fetched. */
        getProductCreationSchema: build.mutation<IResponse<unknown>, number>({
          query: (typeOfNomenclatureId) => ({
            path: `/integration-configs/product-creation-schema/${typeOfNomenclatureId}`,
            method: 'GET',
          }),
        }),
        /** A filled-in sample of the product-creation payload for one nomenclature type — same on-demand-only shape as `getProductCreationSchema`. */
        getProductCreationExample: build.mutation<
          IResponse<IProductCreationExample>,
          { typeOfNomenclatureId: number; externalSystemId?: number | null }
        >({
          query: ({ typeOfNomenclatureId, externalSystemId }) => {
            const qs = externalSystemId
              ? `?externalSystemId=${externalSystemId}`
              : '';
            return {
              path: `/integration-configs/product-creation-example/${typeOfNomenclatureId}${qs}`,
              method: 'GET',
            };
          },
        }),
      };
    },
  });

export const {
  useGetExternalSystemsQuery,
  useGetOneExternalSystemQuery,
  useCreateExternalSystemMutation,
  useUpdateExternalSystemMutation,
  useDeleteExternalSystemMutation,
  useGetIntegrationConfigsBySystemQuery,
  useGetIntegrationConfigsQuery,
  useGetOneIntegrationConfigQuery,
  useCreateIntegrationConfigMutation,
  useUpdateIntegrationConfigMutation,
  useDeleteIntegrationConfigMutation,
  useGetProductSourceTreeQuery,
  useGetProductGroupSourceTreeQuery,
  useGetProductRateSourceTreeQuery,
  useGetDealerSourceTreeQuery,
  useLazyGetNomenclatureSourceTreeByIdQuery,
  useGetProductCreationSchemaMutation,
  useGetProductCreationExampleMutation,
} = externalSystemApiHooks;
