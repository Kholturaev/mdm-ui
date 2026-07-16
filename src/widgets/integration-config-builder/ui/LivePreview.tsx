import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { IIntegrationMapping } from '@entities/external-system/model/types';
import {
  mappingsToJsonPreviewLines,
  mappingsToXmlPreviewLines,
} from '@entities/external-system/lib/integrationPreview';
import type { PreviewLine } from '@entities/external-system/lib/integrationPreview';
import { Button } from '@shared/ui/Button';
import { Checkbox } from '@shared/ui/Checkbox';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { Spinner } from '@shared/ui/Spinner';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { CopyStackIcon } from '@shared/ui/icons/CopyStackIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';
import { ExcelImportIcon } from '@shared/ui/icons/ExcelImportIcon';
import { DocumentIcon } from '@shared/ui/icons/DocumentIcon';
import { PackageIcon } from '@shared/ui/icons/PackageIcon';
import { Permissions } from '@shared/constants/permissions';
import { notify } from '@shared/lib/toast';
import { cn } from '@shared/lib/cn';
import type { MappingConflicts } from '../lib/mappingConflicts';
import { useFocusedSourcePath } from '../lib/focusedField';

/** Isolated so highlighting the focused line only re-renders that one row, not the whole (potentially large) preview. */
const PreviewLineRow = memo(function PreviewLineRow({
  text,
  isHighlighted,
}: {
  text: string;
  isHighlighted: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-sm px-1',
        isHighlighted && 'bg-primary/15 outline-primary/40 outline-1',
      )}
    >
      {text || ' '}
    </div>
  );
});

type LivePreviewProps = {
  mappings: IIntegrationMapping[];
  format: 'JSON' | 'XML';
  onFormatChange: (format: 'JSON' | 'XML') => void;
  rootName: string;
  conflicts: MappingConflicts;
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  saveDisabled: boolean;
  saveLabel: string;
  onProductImport?: () => void;
  onDownloadExcelTemplate: () => void;
  isDownloadingExcelTemplate: boolean;
  downloadExcelTemplateDisabled: boolean;
  onDownloadSchemaJson: () => void;
  isDownloadingSchemaJson: boolean;
  downloadSchemaJsonDisabled: boolean;
  onDownloadExampleJson: () => void;
  isDownloadingExampleJson: boolean;
  downloadExampleJsonDisabled: boolean;
};

export function LivePreview({
  mappings,
  format,
  onFormatChange,
  rootName,
  conflicts,
  isActive,
  onActiveChange,
  onSave,
  isSaving,
  saveDisabled,
  saveLabel,
  onProductImport,
  onDownloadExcelTemplate,
  isDownloadingExcelTemplate,
  downloadExcelTemplateDisabled,
  onDownloadSchemaJson,
  isDownloadingSchemaJson,
  downloadSchemaJsonDisabled,
  onDownloadExampleJson,
  isDownloadingExampleJson,
  downloadExampleJsonDisabled,
}: LivePreviewProps) {
  const { t } = useTranslation();
  const focusedSourcePath = useFocusedSourcePath();

  const previewLines = useMemo<PreviewLine[]>(() => {
    if (format === 'XML') {
      return mappingsToXmlPreviewLines(mappings, rootName || 'root');
    }
    return mappingsToJsonPreviewLines(mappings);
  }, [mappings, format, rootName]);

  const previewText = useMemo(
    () => previewLines.map((line) => line.text).join('\n'),
    [previewLines],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    notify.success(t('common.copied'));
  };

  const handleDownload = () => {
    const mime = format === 'XML' ? 'application/xml' : 'application/json';
    const extension = format === 'XML' ? 'xml' : 'json';
    const blob = new Blob([previewText], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${rootName || 'preview'}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-w-0 flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 2xl:flex">
          {onProductImport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<ExcelImportIcon size={14} />}
              onClick={onProductImport}
            >
              {t('externalSystem.config.productImport')}
            </Button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Checkbox
            label={t('externalSystem.config.isActive')}
            checked={isActive}
            onChange={(e) => onActiveChange(e.target.checked)}
          />
          <SegmentedControl
            size="xs"
            value={format}
            onChange={onFormatChange}
            options={[
              { label: 'JSON', value: 'JSON' },
              { label: 'XML', value: 'XML' },
            ]}
          />
          <PermissionGuard permission={Permissions.EXTERNAL_SYSTEM.UPDATE}>
            <Button
              type="button"
              size="sm"
              isLoading={isSaving}
              disabled={saveDisabled}
              onClick={onSave}
            >
              {saveLabel}
            </Button>
          </PermissionGuard>
        </div>
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

      <div className="relative min-h-0 min-w-0 flex-1">
        <div className="border-border bg-surface-hover size-full overflow-auto rounded-md border p-3 font-mono text-[11px] whitespace-pre 2xl:text-xs">
          {previewLines.map((line, index) => (
            <PreviewLineRow
              key={index}
              text={line.text}
              isHighlighted={
                line.sourcePath !== null &&
                line.sourcePath === focusedSourcePath
              }
            />
          ))}
        </div>
        <div className="border-border bg-surface absolute top-2 right-2 flex items-center gap-1 rounded-md border p-1 shadow-sm">
          <button
            type="button"
            title={t('common.copy')}
            onClick={handleCopy}
            className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded transition-colors"
          >
            <CopyStackIcon size={14} />
          </button>
          <button
            type="button"
            title={t('externalSystem.config.downloadExcelTemplate')}
            onClick={onDownloadExcelTemplate}
            disabled={
              isDownloadingExcelTemplate || downloadExcelTemplateDisabled
            }
            className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDownloadingExcelTemplate ? (
              <Spinner className="size-3.5" />
            ) : (
              <ExcelImportIcon size={14} />
            )}
          </button>
          <button
            type="button"
            title={
              downloadSchemaJsonDisabled
                ? t('externalSystem.config.selectNomenclatureTypeFirst')
                : t('externalSystem.config.downloadSchemaJson')
            }
            onClick={onDownloadSchemaJson}
            disabled={isDownloadingSchemaJson || downloadSchemaJsonDisabled}
            className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDownloadingSchemaJson ? (
              <Spinner className="size-3.5" />
            ) : (
              <DocumentIcon size={14} />
            )}
          </button>
          <button
            type="button"
            title={
              downloadExampleJsonDisabled
                ? t('externalSystem.config.selectNomenclatureTypeFirst')
                : t('externalSystem.config.downloadExampleJson')
            }
            onClick={onDownloadExampleJson}
            disabled={isDownloadingExampleJson || downloadExampleJsonDisabled}
            className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDownloadingExampleJson ? (
              <Spinner className="size-3.5" />
            ) : (
              <PackageIcon size={14} />
            )}
          </button>
          <button
            type="button"
            title={t('common.download', { format })}
            onClick={handleDownload}
            className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded transition-colors"
          >
            <DownloadIcon size={14} />
          </button>
        </div>
      </div>

      {onProductImport && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          icon={<ExcelImportIcon size={14} />}
          onClick={onProductImport}
          className="2xl:hidden"
        >
          {t('externalSystem.config.productImport')}
        </Button>
      )}
    </div>
  );
}
