import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useGetClientTypesQuery } from '@entities/client-type/api/clientTypeApi';
import { env } from '@shared/config/env';
import type { ApiException } from '@shared/api/type';
import { parseApiError } from '@shared/api/parseApiError';
import { notify } from '@shared/lib/toast';
import { cn } from '@shared/lib/cn';
import { Button } from '@shared/ui/Button';
import { Spinner } from '@shared/ui/Spinner';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { Checkbox } from '@shared/ui/Checkbox';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';
import { CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import type {
  ProductImportPreviewDto,
  ProductImportResultDto,
} from '../model/types';
import { useDownloadProductTemplate } from '../model/useDownloadProductTemplate';
import {
  useGetProductImportExternalSystemsQuery,
  usePreviewProductImportMutation,
  useExecuteProductImportMutation,
} from '../api/productImportApi';

type Step = 1 | 2 | 3;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function StepIndicator({ current }: { current: Step }) {
  const { t } = useTranslation();
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: t('product.import.step1Label') },
    { id: 2, label: t('product.import.step2Label') },
    { id: 3, label: t('product.import.step3Label') },
  ];

  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s.id} className="flex flex-1 items-center">
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                current > s.id
                  ? 'bg-primary text-primary-foreground'
                  : current === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-fg-muted border',
              )}
            >
              {current > s.id ? <CheckIcon size={12} /> : s.id}
            </div>
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap',
                current >= s.id ? 'text-fg' : 'text-fg-muted',
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'mx-3 h-px flex-1',
                current > s.id ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = 'neutral',
}: {
  label: string;
  value: number;
  variant?: 'neutral' | 'success' | 'danger' | 'warning';
}) {
  const colors: Record<typeof variant, string> = {
    neutral: 'text-fg',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
  };
  return (
    <div className="bg-bg rounded-lg px-4 py-3 text-center">
      <div className={cn('text-2xl font-bold tabular-nums', colors[variant])}>
        {value}
      </div>
      <div className="text-fg-muted mt-0.5 text-xs">{label}</div>
    </div>
  );
}

function ErrorTable({
  rows,
}: {
  rows: ProductImportPreviewDto['sampleErrors'];
}) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;
  return (
    <div className="border-border overflow-hidden rounded-lg border text-xs">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-bg">
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('product.import.row')}
            </th>
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('product.import.column')}
            </th>
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('product.import.error')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="bg-surface even:bg-bg">
              <td className="border-border border-b px-3 py-1.5 font-mono">
                {row.rowNumber}
              </td>
              <td className="border-border text-fg-muted border-b px-3 py-1.5">
                {row.column ?? '—'}
              </td>
              <td className="border-border text-danger border-b px-3 py-1.5">
                {row.error}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductImportModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [externalSystemIds, setExternalSystemIds] = useState<number[]>([]);
  const [includePrice, setIncludePrice] = useState(false);
  const [clientTypeIds, setClientTypeIds] = useState<number[]>([]);
  const [preview, setPreview] = useState<ProductImportPreviewDto | null>(null);
  const [result, setResult] = useState<ProductImportResultDto | null>(null);

  const { data: externalSystemsData, isFetching: isLoadingSystems } =
    useGetProductImportExternalSystemsQuery();
  const systemOptions = useMemo<SelectOption[]>(
    () =>
      (externalSystemsData?.data ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [externalSystemsData],
  );

  const { data: clientTypesData, isFetching: isLoadingClientTypes } =
    useGetClientTypesQuery({ page: 0, size: 100 }, { skip: !includePrice });
  const clientTypes = clientTypesData?.data?.data ?? [];

  const { downloadTemplate, isDownloading } = useDownloadProductTemplate();
  const [previewImport, { isLoading: isPreviewing }] =
    usePreviewProductImportMutation();
  const [executeImport, { isLoading: isExecuting }] =
    useExecuteProductImportMutation();

  const hasSystemSelection = externalSystemIds.length > 0;
  const clientTypeSatisfied = !includePrice || clientTypeIds.length > 0;
  const isConfigValid = hasSystemSelection && clientTypeSatisfied;

  const resetAll = useCallback(() => {
    setStep(1);
    setFile(null);
    setExternalSystemIds([]);
    setIncludePrice(false);
    setClientTypeIds([]);
    setPreview(null);
    setResult(null);
  }, []);

  const resetAndClose = useCallback(() => {
    resetAll();
    onClose();
  }, [onClose, resetAll]);

  const resetToStart = useCallback(() => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setResult(null);
  }, []);

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.xlsx')) {
      notify.error(t('product.import.onlyXlsx'));
      return;
    }
    setFile(selected);
  };

  const handleIncludePriceChange = (checked: boolean) => {
    setIncludePrice(checked);
    if (!checked) setClientTypeIds([]);
  };

  const toggleClientType = (id: number) => {
    setClientTypeIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id],
    );
  };

  const handleDownloadTemplate = () => {
    if (!isConfigValid) return;
    downloadTemplate({ externalSystemIds, includePrice, clientTypeIds });
  };

  const handleNext = async () => {
    if (!file || !isConfigValid) return;
    setStep(2);
    setPreview(null);
    try {
      const res = await previewImport({ file, externalSystemIds }).unwrap();
      setPreview(res.data);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
      setStep(1);
    }
  };

  const handleExecute = async () => {
    if (!file) return;
    try {
      const res = await executeImport({ file, externalSystemIds }).unwrap();
      setResult(res.data);
      setStep(3);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDownloadErrors = () => {
    if (!result?.errorFileUrl) return;
    const url = result.errorFileUrl.startsWith('http')
      ? result.errorFileUrl
      : `${env.apiUrl}${result.errorFileUrl}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root') ?? document.body;
  const canExecute = preview !== null && preview.validRows > 0;
  const hasErrors = (result?.failed ?? 0) > 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="border-border flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <div className="text-fg text-base font-semibold">
              {t('product.import.title')}
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close"
            className="border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg ml-4 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="border-border border-b px-6 py-4">
          <StepIndicator current={step} />
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Config section: external system (required), price + client type (optional) */}
              <div className="bg-bg border-border rounded-xl border p-5">
                <div className="mb-4">
                  <div className="text-fg text-sm font-semibold">
                    {t('product.import.configTitle')}
                  </div>
                  <div className="text-fg-muted mt-0.5 text-xs leading-relaxed">
                    {t('product.import.templateDesc')}
                  </div>
                </div>

                <Select<SelectOption, true>
                  label={t('product.import.externalSystemLabel')}
                  required
                  isMulti
                  isSearchable
                  size="sm"
                  isLoading={isLoadingSystems}
                  options={systemOptions}
                  value={systemOptions.filter((o) =>
                    externalSystemIds.includes(Number(o.value)),
                  )}
                  onChange={(next) =>
                    setExternalSystemIds(
                      (next ?? []).map((o) => Number(o.value)),
                    )
                  }
                  placeholder={t('product.import.externalSystemPlaceholder')}
                />

                <div className="border-border mt-4 rounded-lg border p-3">
                  <Checkbox
                    label={t('product.import.includePrice')}
                    checked={includePrice}
                    onChange={(e) => handleIncludePriceChange(e.target.checked)}
                  />

                  {includePrice && (
                    <div className="mt-3 pl-1">
                      <div className="text-fg-muted mb-2 text-xs">
                        {t('product.import.clientTypeLabel')}
                      </div>
                      {isLoadingClientTypes ? (
                        <Spinner className="text-primary size-4" />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {clientTypes.map((ct) => (
                            <Checkbox
                              key={ct.id}
                              label={ct.name}
                              checked={clientTypeIds.includes(ct.id)}
                              onChange={() => toggleClientType(ct.id)}
                            />
                          ))}
                        </div>
                      )}
                      {!isLoadingClientTypes &&
                        includePrice &&
                        clientTypeIds.length === 0 && (
                          <div className="text-warning mt-2 text-xs">
                            {t('product.import.clientTypeRequiredHint')}
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<DownloadIcon size={14} />}
                    isLoading={isDownloading}
                    disabled={!isConfigValid}
                    onClick={handleDownloadTemplate}
                  >
                    {t('product.import.downloadTemplate')}
                  </Button>
                  {!hasSystemSelection && (
                    <span className="text-fg-muted text-xs">
                      {t('product.import.externalSystemRequiredHint')}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload section */}
              <div className="bg-bg border-border rounded-xl border p-5">
                <div className="text-fg mb-3 text-sm font-semibold">
                  {t('product.import.uploadTitle')}
                </div>
                {file ? (
                  <div className="border-border flex items-center gap-3 rounded-lg border bg-white px-4 py-3 dark:bg-white/5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="14 2 14 8 20 8"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-fg truncate text-sm font-medium">
                        {file.name}
                      </div>
                      <div className="text-fg-muted text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-fg-muted hover:text-danger shrink-0 transition-colors"
                      title={t('product.import.removeFile')}
                    >
                      <XCircleIcon size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] ?? null)
                      }
                    />
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileSelect(e.dataTransfer.files[0] ?? null);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/60 hover:bg-primary/5',
                      )}
                    >
                      <div className="bg-surface text-fg-muted flex size-12 items-center justify-center rounded-xl border border-dashed border-current">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-fg text-sm font-medium">
                          {t('product.import.dropzoneText')}{' '}
                        </span>
                        <span className="text-primary text-sm font-medium underline-offset-2 hover:underline">
                          {t('product.import.browse')}
                        </span>
                      </div>
                      <div className="text-fg-muted text-xs">
                        {t('product.import.formatHint')}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {isPreviewing || !preview ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Spinner className="text-primary size-8" />
                  <div className="text-fg-muted text-sm">
                    {t('product.import.validating')}
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <StatCard
                      label={t('product.import.totalRows')}
                      value={preview.totalRows}
                    />
                    <StatCard
                      label={t('product.import.validRows')}
                      value={preview.validRows}
                      variant={preview.validRows > 0 ? 'success' : 'neutral'}
                    />
                    <StatCard
                      label={t('product.import.willCreate')}
                      value={preview.willCreate}
                      variant="neutral"
                    />
                    <StatCard
                      label={t('product.import.willUpdate')}
                      value={preview.willUpdate}
                      variant="neutral"
                    />
                  </div>

                  {/* Missing required columns */}
                  {preview.missingRequiredColumns.length > 0 && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
                      <span className="text-danger mt-0.5 shrink-0">
                        <XCircleIcon size={16} />
                      </span>
                      <div className="text-xs">
                        <div className="text-danger font-semibold">
                          {t('product.import.missingColumns')}
                        </div>
                        <div className="text-danger/80 mt-1">
                          {preview.missingRequiredColumns.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Duplicate warnings */}
                  {preview.duplicateWarnings.length > 0 && (
                    <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/40 dark:bg-yellow-900/20">
                      <span className="text-warning mt-0.5 shrink-0">
                        <AlertTriangleIcon size={16} />
                      </span>
                      <div className="text-xs">
                        <div className="text-warning font-semibold">
                          {t('product.import.duplicateWarnings')}
                        </div>
                        <div className="text-fg-muted mt-1">
                          {preview.duplicateWarnings.slice(0, 3).join(', ')}
                          {preview.duplicateWarnings.length > 3 &&
                            ` +${preview.duplicateWarnings.length - 3}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invalid rows notice */}
                  {preview.invalidRows > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2.5 dark:bg-red-900/20">
                      <span className="text-danger text-xs font-medium">
                        {preview.invalidRows} {t('product.import.invalidRows')}
                      </span>
                      {preview.validRows > 0 && (
                        <span className="text-fg-muted text-xs">
                          {t('product.import.canProceed', {
                            count: preview.validRows,
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Error table */}
                  {preview.sampleErrors.length > 0 && (
                    <div>
                      <div className="text-fg mb-2 text-xs font-semibold">
                        {t('product.import.sampleErrors', {
                          count: preview.sampleErrors.length,
                        })}
                      </div>
                      <ErrorTable rows={preview.sampleErrors} />
                    </div>
                  )}

                  {/* All OK indicator */}
                  {preview.invalidRows === 0 &&
                    preview.missingRequiredColumns.length === 0 && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-900/20">
                        <span className="text-success shrink-0">
                          <CheckCircleIcon size={16} />
                        </span>
                        <span className="text-success text-xs font-medium">
                          {t('product.import.noErrors')}
                        </span>
                      </div>
                    )}

                  {/* No valid rows warning */}
                  {preview.validRows === 0 && (
                    <div className="bg-bg text-fg-muted rounded-lg px-4 py-3 text-center text-xs">
                      {t('product.import.noValidRows')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && result && (
            <div className="flex flex-col gap-5">
              {/* Result header */}
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div
                  className={cn(
                    'flex size-14 items-center justify-center rounded-full',
                    hasErrors
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                  )}
                >
                  {hasErrors ? (
                    <AlertTriangleIcon size={28} />
                  ) : (
                    <CheckCircleIcon size={28} />
                  )}
                </div>
                <div>
                  <div className="text-fg text-base font-semibold">
                    {hasErrors
                      ? t('product.import.partialTitle')
                      : t('product.import.successTitle')}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <StatCard
                  label={t('product.import.totalRows')}
                  value={result.totalRows}
                />
                <StatCard
                  label={t('product.import.inserted')}
                  value={result.inserted}
                  variant="success"
                />
                <StatCard
                  label={t('product.import.updated')}
                  value={result.updated}
                  variant="neutral"
                />
                <StatCard
                  label={t('product.import.failed')}
                  value={result.failed}
                  variant={result.failed > 0 ? 'danger' : 'neutral'}
                />
              </div>

              {/* Error rows */}
              {result.errors.length > 0 && (
                <div>
                  <div className="text-fg mb-2 text-xs font-semibold">
                    {t('product.import.sampleErrors', {
                      count: result.errors.length,
                    })}
                  </div>
                  <ErrorTable rows={result.errors} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex shrink-0 items-center justify-between border-t px-6 py-4">
          {step === 1 && (
            <>
              <Button variant="outline" size="sm" onClick={resetAndClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!file || !isConfigValid}
                onClick={handleNext}
              >
                {t('product.import.next')}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                disabled={isPreviewing}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isExecuting}
                disabled={!canExecute || isPreviewing}
                onClick={handleExecute}
              >
                {t('product.import.execute')}
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<DownloadIcon size={14} />}
                disabled={!result?.errorFileUrl}
                onClick={handleDownloadErrors}
              >
                {t('product.import.downloadErrors')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetToStart}>
                  {t('product.import.newImport')}
                </Button>
                <Button variant="primary" size="sm" onClick={resetAndClose}>
                  {t('common.cancel')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
