import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@shared/api';
import { notify } from '@shared/lib/toast';

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

export function useDownloadCharacteristicTemplate() {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const res = await api.fetch<Blob>({
        path: '/characteristics/import/template.xlsx',
        responseType: 'blob',
      });
      triggerBlobDownload(res.data, 'characteristic-import-template.xlsx');
    } catch {
      notify.error(t('message.error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadTemplate, isDownloading };
}
