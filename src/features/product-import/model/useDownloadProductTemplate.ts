import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@shared/api';
import { notify } from '@shared/lib/toast';
import { buildTemplateDownloadPath } from '../lib/buildImportQuery';
import type { ProductImportParams } from '../lib/buildImportQuery';

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

export function useDownloadProductTemplate() {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTemplate = async (params: ProductImportParams) => {
    setIsDownloading(true);
    try {
      const res = await api.fetch<Blob>({
        path: buildTemplateDownloadPath(params),
        responseType: 'blob',
      });
      triggerBlobDownload(res.data, 'nomenclature-template.xlsx');
    } catch {
      notify.error(t('message.error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadTemplate, isDownloading };
}
