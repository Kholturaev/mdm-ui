import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IExternalSystem } from '@entities/external-system/model/types';
import { useGetIntegrationConfigsBySystemQuery } from '@entities/external-system/api/externalSystemApi';
import {
  flattenMappings,
  mappingsToPreviewObject,
} from '@entities/external-system/lib/integrationPreview';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { cn } from '@shared/lib/cn';
import { systemAbbr } from '@shared/lib/systemAbbr';
import { notify } from '@shared/lib/toast';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { EyeIcon } from '@shared/ui/icons/EyeIcon';

type ExternalSystemCardProps = {
  system: IExternalSystem;
  typeOfNomenclatureId: number | null;
  /** Best-effort label for the currently selected nomenclature type — only used when this system's own config has no type-specific mapping to name it. */
  typeOfNomenclatureName: string | null;
  checked: boolean;
  onToggle: () => void;
};

/** Toggleable card for one external system in the product-create form — shows which of its configured fields are required, and lets the user preview a sample JSON payload (built from the system's real integration config) before committing to create. */
export function ExternalSystemCard({
  system,
  typeOfNomenclatureId,
  typeOfNomenclatureName,
  checked,
  onToggle,
}: ExternalSystemCardProps) {
  const { t } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data, isFetching } = useGetIntegrationConfigsBySystemQuery({
    externalSystemId: system.id,
  });

  const configs = data?.data?.data ?? [];
  const config =
    configs.find((c) => c.isActive && c.isDefault) ??
    configs.find((c) => c.isActive) ??
    configs[0];
  const productSection = config?.sections.find(
    (section) => section.sectionType === 'PRODUCT',
  );
  const matchedNomenclature = productSection?.nomenclatures?.find(
    (item) => item.typeOfNomenclatureId === typeOfNomenclatureId,
  );

  const allMappings = useMemo(
    () => [
      ...(productSection?.mappings ?? []),
      ...(matchedNomenclature?.mappings ?? []),
    ],
    [productSection, matchedNomenclature],
  );

  const requiredTargets = flattenMappings(allMappings)
    .filter((mapping) => mapping.required && mapping.targetPath)
    .map((mapping) => mapping.targetPath);

  const previewJson = useMemo(
    () => JSON.stringify(mappingsToPreviewObject(allMappings), null, 2),
    [allMappings],
  );

  const resolvedTypeName =
    matchedNomenclature?.typeOfNomenclatureName ?? typeOfNomenclatureName;

  const hintText = isFetching
    ? t('common.loading')
    : !config
      ? t('product.externalSystemsNoConfig')
      : requiredTargets.length > 0
        ? t('product.externalSystemsRequiredFields', {
            fields: requiredTargets.join(', '),
          })
        : t('product.externalSystemsNoExtraFields');

  const handleCopy = () => {
    navigator.clipboard.writeText(previewJson);
    notify.success(t('common.copied'));
  };

  return (
    <div
      className={cn(
        'border-border flex flex-col gap-2 rounded-lg border p-3 transition-colors',
        checked && 'border-primary bg-primary/5',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-start justify-between gap-2 text-left"
      >
        <span className="flex items-start gap-2">
          <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded text-xs font-bold">
            {systemAbbr(system.name)}
          </span>
          <span className="min-w-0">
            <span className="text-fg block truncate text-sm font-semibold">
              {system.name}
            </span>
            {system.description && (
              <span className="text-fg-muted block truncate text-xs">
                {system.description}
              </span>
            )}
          </span>
        </span>
        <span
          className={cn(
            'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
            checked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border-strong',
          )}
        >
          {checked && <CheckIcon size={10} />}
        </span>
      </button>

      <div className="flex items-center justify-between gap-2">
        <p className="text-fg-muted min-w-0 flex-1 truncate text-[11px]">
          {hintText}
        </p>
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          title={t('product.externalSystemsPreview')}
          className="text-fg-muted hover:bg-surface-hover hover:text-fg shrink-0 rounded p-1 transition-colors"
        >
          <EyeIcon size={14} />
        </button>
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={system.name}
        size="lg"
      >
        {isFetching ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-primary size-6" />
          </div>
        ) : !config ? (
          <p className="text-fg-muted py-8 text-center text-sm">
            {t('product.externalSystemsNoConfig')}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-fg-muted text-xs">
              {t('product.externalSystemsPreviewHint')}
            </p>
            {resolvedTypeName && (
              <p className="text-fg-muted text-xs">
                {t('product.externalSystemsSelectedType', {
                  name: resolvedTypeName,
                })}
              </p>
            )}
            <pre className="border-border bg-surface-hover max-h-96 overflow-auto rounded-md border p-3 text-xs">
              {previewJson}
            </pre>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {t('common.copy')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
