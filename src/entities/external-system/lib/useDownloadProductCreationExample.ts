import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadJson } from '@shared/lib/downloadJson';
import { notify } from '@shared/lib/toast';
import { useGetProductCreationExampleMutation } from '../api/externalSystemApi';

type Params = {
  typeOfNomenclatureId: number | null;
  externalSystemId?: number | null;
  externalSystemName?: string | null;
};

/** Downloads a filled-in sample product-creation payload for a nomenclature type — mirrors akfa-data-frontend's "Namuna JSON yuklab olish" action. Disabled until a nomenclature type is selected, same as `useDownloadProductCreationSchema`. */
export function useDownloadProductCreationExample({
  typeOfNomenclatureId,
  externalSystemId,
  externalSystemName,
}: Params) {
  const { t } = useTranslation();
  const [getProductCreationExample, { isLoading: isDownloading }] =
    useGetProductCreationExampleMutation();

  const canDownload = Boolean(typeOfNomenclatureId);

  const handleDownload = useCallback(async () => {
    if (!typeOfNomenclatureId) return;
    try {
      const res = await getProductCreationExample({
        typeOfNomenclatureId,
        externalSystemId,
      }).unwrap();

      const { typeOfNomenclatureName, examplePayload } = res.data;
      const systemPart =
        externalSystemName || externalSystemId || 'external-system';

      downloadJson(
        examplePayload,
        `product-example-${typeOfNomenclatureName || typeOfNomenclatureId}-${systemPart}`,
      );
    } catch {
      notify.error(t('message.error'));
    }
  }, [
    typeOfNomenclatureId,
    externalSystemId,
    externalSystemName,
    getProductCreationExample,
    t,
  ]);

  return { isDownloading, canDownload, handleDownload };
}
