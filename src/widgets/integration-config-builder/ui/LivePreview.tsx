import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IIntegrationMapping } from '@entities/external-system/model/types';
import {
  mappingsToPreviewObject,
  mappingsToXmlString,
} from '@entities/external-system/lib/integrationPreview';
import { Button } from '@shared/ui/Button';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { notify } from '@shared/lib/toast';
import type { MappingConflicts } from '../lib/mappingConflicts';

type LivePreviewProps = {
  mappings: IIntegrationMapping[];
  format: 'JSON' | 'XML';
  rootName: string;
  conflicts: MappingConflicts;
};

export function LivePreview({
  mappings,
  format,
  rootName,
  conflicts,
}: LivePreviewProps) {
  const { t } = useTranslation();
  const [displayFormat, setDisplayFormat] = useState<'JSON' | 'XML'>(format);

  const previewText = useMemo(() => {
    if (displayFormat === 'XML') {
      return mappingsToXmlString(mappings, rootName || 'root');
    }
    return JSON.stringify(mappingsToPreviewObject(mappings), null, 2);
  }, [mappings, displayFormat, rootName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    notify.success(t('common.copied'));
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-fg text-sm font-semibold">
          {t('externalSystem.config.livePreview')}
        </h3>
        <SegmentedControl
          size="xs"
          value={displayFormat}
          onChange={setDisplayFormat}
          options={[
            { label: 'JSON', value: 'JSON' },
            { label: 'XML', value: 'XML' },
          ]}
        />
      </div>

      {conflicts.conflictCount > 0 && (
        <div className="border-danger bg-danger/10 flex items-start gap-2 rounded-lg border p-2.5">
          <span className="text-danger mt-0.5 shrink-0">
            <AlertTriangleIcon size={14} />
          </span>
          <p className="text-danger text-xs">
            {t('externalSystem.config.duplicateTargetKeysFound', {
              count: conflicts.conflictCount,
            })}
          </p>
        </div>
      )}

      <pre className="border-border bg-surface-hover min-h-0 flex-1 overflow-auto rounded-md border p-3 text-xs">
        {previewText}
      </pre>

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {t('common.copy')}
        </Button>
      </div>
    </div>
  );
}
