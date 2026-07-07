import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type {
  IProductAttribute,
  ProductAttributeFormValues,
} from '../model/types';

export const addTagTypes = ['product-attribute'] as const;

export const productAttributeApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        IProductAttribute,
        ProductAttributeFormValues
      >(build, {
        basePath: '/product-attributes',
        tagType: 'product-attribute',
      });
      return {
        getProductAttributes: crud.getList,
        createProductAttribute: crud.create,
        updateProductAttribute: crud.update,
        deleteProductAttribute: crud.remove,
      };
    },
  });

export const {
  useGetProductAttributesQuery,
  useCreateProductAttributeMutation,
  useUpdateProductAttributeMutation,
  useDeleteProductAttributeMutation,
} = productAttributeApiHooks;
