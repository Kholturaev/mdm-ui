import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@shared/api';
import { notify } from '@shared/lib/toast';
import type { IntegrationConfigSectionType } from '../model/types';

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Downloads a ready-to-fill Excel import template for one external system's saved section — mirrors akfa-data-frontend's "Excel sifatida yuklab olish" action (separate from the product-import wizard's own template step). */
export function useImportTemplateExcel() {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTemplate = async (params: {
    externalSystemId: number;
    sectionType: IntegrationConfigSectionType;
  }) => {
    setIsDownloading(true);
    try {
      const res = await api.fetch<Blob>({
        path: `/product/import/template.xlsx?externalSystemId=${params.externalSystemId}&sectionType=${params.sectionType}`,
        responseType: 'blob',
      });
      triggerBlobDownload(
        res.data,
        `import-template-${params.sectionType.toLowerCase()}.xlsx`,
      );
    } catch {
      notify.error(t('message.error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadTemplate, isDownloading };
}
