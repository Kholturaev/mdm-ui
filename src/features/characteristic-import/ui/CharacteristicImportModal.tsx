import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { ApiException } from '@shared/api/type';
import { parseApiError } from '@shared/api/parseApiError';
import { notify } from '@shared/lib/toast';
import { cn } from '@shared/lib/cn';
import { Button } from '@shared/ui/Button';
import { Spinner } from '@shared/ui/Spinner';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';
import { CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import type {
  CharacteristicImportPreviewDto,
  CharacteristicImportExecuteDto,
} from '../model/types';
import { useDownloadCharacteristicTemplate } from '../model/useDownloadCharacteristicTemplate';
import {
  usePreviewCharacteristicImportMutation,
  useExecuteCharacteristicImportMutation,
} from '../api/characteristicImportApi';

type Step = 1 | 2 | 3;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function StepIndicator({ current }: { current: Step }) {
  const { t } = useTranslation();
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: t('characteristic.import.step1Label') },
    { id: 2, label: t('characteristic.import.step2Label') },
    { id: 3, label: t('characteristic.import.step3Label') },
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
  rows: CharacteristicImportPreviewDto['errorRows'];
}) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;
  return (
    <div className="border-border overflow-hidden rounded-lg border text-xs">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-bg">
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('characteristic.import.row')}
            </th>
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('characteristic.import.column')}
            </th>
            <th className="border-border border-b px-3 py-2 text-left font-semibold">
              {t('characteristic.import.error')}
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
                {row.name || row.key || '—'}
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

export function CharacteristicImportModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<CharacteristicImportPreviewDto | null>(
    null,
  );
  const [result, setResult] = useState<CharacteristicImportExecuteDto | null>(
    null,
  );

  const { downloadTemplate, isDownloading } =
    useDownloadCharacteristicTemplate();
  const [previewImport, { isLoading: isPreviewing }] =
    usePreviewCharacteristicImportMutation();
  const [executeImport, { isLoading: isExecuting }] =
    useExecuteCharacteristicImportMutation();

  const resetAll = useCallback(() => {
    setStep(1);
    setFile(null);
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
      notify.error(t('characteristic.import.onlyXlsx'));
      return;
    }
    setFile(selected);
  };

  const handleNext = async () => {
    if (!file) return;
    setStep(2);
    setPreview(null);
    try {
      const res = await previewImport({ file }).unwrap();
      setPreview(res.data);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
      setStep(1);
    }
  };

  const handleExecute = async () => {
    if (!file) return;
    try {
      const res = await executeImport({ file }).unwrap();
      setResult(res.data);
      setStep(3);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root') ?? document.body;
  const canExecute = preview !== null && preview.validRows.length > 0;

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
              {t('characteristic.import.title')}
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
              <div className="bg-bg border-border rounded-xl border p-5">
                <div className="mb-4">
                  <div className="text-fg text-sm font-semibold">
                    {t('characteristic.import.configTitle')}
                  </div>
                  <div className="text-fg-muted mt-0.5 text-xs leading-relaxed">
                    {t('characteristic.import.templateDesc')}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<DownloadIcon size={14} />}
                  isLoading={isDownloading}
                  onClick={downloadTemplate}
                >
                  {t('characteristic.import.downloadTemplate')}
                </Button>
              </div>

              <div className="bg-bg border-border rounded-xl border p-5">
                <div className="text-fg mb-3 text-sm font-semibold">
                  {t('characteristic.import.uploadTitle')}
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
                      title={t('characteristic.import.removeFile')}
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
                          {t('characteristic.import.dropzoneText')}{' '}
                        </span>
                        <span className="text-primary text-sm font-medium underline-offset-2 hover:underline">
                          {t('characteristic.import.browse')}
                        </span>
                      </div>
                      <div className="text-fg-muted text-xs">
                        {t('characteristic.import.formatHint')}
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
                    {t('characteristic.import.validating')}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      label={t('characteristic.import.totalRows')}
                      value={
                        preview.validRows.length + preview.errorRows.length
                      }
                    />
                    <StatCard
                      label={t('characteristic.import.validRows')}
                      value={preview.validRows.length}
                      variant={
                        preview.validRows.length > 0 ? 'success' : 'neutral'
                      }
                    />
                    <StatCard
                      label={t('characteristic.import.invalidRows')}
                      value={preview.errorRows.length}
                      variant={
                        preview.errorRows.length > 0 ? 'danger' : 'neutral'
                      }
                    />
                  </div>

                  {preview.errorRows.length > 0 && (
                    <div>
                      <div className="text-fg mb-2 text-xs font-semibold">
                        {t('characteristic.import.sampleErrors', {
                          count: preview.errorRows.length,
                        })}
                      </div>
                      <ErrorTable rows={preview.errorRows} />
                    </div>
                  )}

                  {preview.errorRows.length === 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-900/20">
                      <span className="text-success shrink-0">
                        <CheckCircleIcon size={16} />
                      </span>
                      <span className="text-success text-xs font-medium">
                        {t('characteristic.import.noErrors')}
                      </span>
                    </div>
                  )}

                  {preview.validRows.length === 0 && (
                    <div className="bg-bg text-fg-muted rounded-lg px-4 py-3 text-center text-xs">
                      {t('characteristic.import.noValidRows')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && result && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircleIcon size={28} />
                </div>
                <div>
                  <div className="text-fg text-base font-semibold">
                    {t('characteristic.import.successTitle')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <StatCard
                  label={t('characteristic.import.created')}
                  value={result.created}
                  variant="success"
                />
              </div>
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
                disabled={!file}
                onClick={handleNext}
              >
                {t('characteristic.import.next')}
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
                {t('characteristic.import.execute')}
              </Button>
            </>
          )}
          {step === 3 && (
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetToStart}>
                {t('characteristic.import.newImport')}
              </Button>
              <Button variant="primary" size="sm" onClick={resetAndClose}>
                {t('common.cancel')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
