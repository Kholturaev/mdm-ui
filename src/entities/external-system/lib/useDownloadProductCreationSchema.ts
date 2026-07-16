import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadJson } from '@shared/lib/downloadJson';
import { notify } from '@shared/lib/toast';
import { useGetProductCreationSchemaMutation } from '../api/externalSystemApi';

/** Downloads the MDM field-dictionary schema for a nomenclature type's product-creation payload — mirrors akfa-data-frontend's "JSON yuklab olish" action. Disabled until a nomenclature type is selected. */
export function useDownloadProductCreationSchema(
  typeOfNomenclatureId: number | null,
) {
  const { t } = useTranslation();
  const [getProductCreationSchema, { isLoading: isDownloading }] =
    useGetProductCreationSchemaMutation();

  const canDownload = Boolean(typeOfNomenclatureId);

  const handleDownload = useCallback(async () => {
    if (!typeOfNomenclatureId) return;
    try {
      const res = await getProductCreationSchema(typeOfNomenclatureId).unwrap();
      downloadJson(res.data, `product-creation-schema-${typeOfNomenclatureId}`);
    } catch {
      notify.error(t('message.error'));
    }
  }, [typeOfNomenclatureId, getProductCreationSchema, t]);

  return { isDownloading, canDownload, handleDownload };
}
