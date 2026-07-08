import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IUnitConversion } from '@entities/product-unit-conversion/model/types';
import { Button } from '@shared/ui/Button';
import { FormPriceInput, FormSelect } from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';

export type UnitConversionSubmitValues = {
  alternativeUnitId: number;
  baseConversionFactor: number;
  alternativeConversionFactor: number;
};

type FormValues = {
  alternativeUnitId: number | null;
  baseConversionFactor: number | null;
  alternativeConversionFactor: number | null;
};

function toDefaultValues(row: IUnitConversion | null): FormValues {
  return {
    alternativeUnitId: row?.alternativeUnitId ?? null,
    baseConversionFactor: row?.baseConversionFactor ?? 1,
    alternativeConversionFactor: row?.alternativeConversionFactor ?? null,
  };
}

export function UnitConversionForm({
  editingRow,
  baseUnitSymbol,
  unitOptions,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  editingRow: IUnitConversion | null;
  baseUnitSymbol: string;
  /** Already excludes the base unit and any other already-converted units (except the one being edited). */
  unitOptions: SelectOption[];
  isSubmitting: boolean;
  onSubmit: (values: UnitConversionSubmitValues) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: toDefaultValues(editingRow),
  });

  useEffect(() => {
    reset(toDefaultValues(editingRow));
  }, [editingRow, reset]);

  const values = useWatch({ control });
  const selectedUnitLabel = useMemo(
    () =>
      unitOptions.find((option) => option.value === values.alternativeUnitId)
        ?.label ?? null,
    [unitOptions, values.alternativeUnitId],
  );

  const canPreview =
    selectedUnitLabel &&
    values.baseConversionFactor &&
    values.alternativeConversionFactor;

  const submit = handleSubmit((formValues) => {
    if (
      !formValues.alternativeUnitId ||
      !formValues.baseConversionFactor ||
      !formValues.alternativeConversionFactor
    ) {
      return;
    }
    onSubmit({
      alternativeUnitId: formValues.alternativeUnitId,
      baseConversionFactor: formValues.baseConversionFactor,
      alternativeConversionFactor: formValues.alternativeConversionFactor,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormSelect
        name="alternativeUnitId"
        control={control}
        options={unitOptions}
        label={t('product.unitConv.otherUnit')}
        required
        isSearchable
        rules={{ required: t('common.required') }}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormPriceInput
          name="baseConversionFactor"
          control={control}
          label={t('product.unitConv.baseFactor', { unit: baseUnitSymbol })}
          required
          placeholder="1"
          rules={{
            required: t('common.required'),
            validate: (value) =>
              (value ?? 0) > 0 || t('product.unitConv.mustBePositive'),
          }}
        />
        <FormPriceInput
          name="alternativeConversionFactor"
          control={control}
          label={t('product.unitConv.altFactor')}
          required
          placeholder="0"
          rules={{
            required: t('common.required'),
            validate: (value) =>
              (value ?? 0) > 0 || t('product.unitConv.mustBePositive'),
          }}
        />
      </div>

      {canPreview && (
        <div className="border-border bg-surface-hover rounded-md border px-3 py-2 text-sm">
          <span className="text-fg font-semibold">
            {values.baseConversionFactor} {baseUnitSymbol}
          </span>
          <span className="text-fg-muted"> = </span>
          <span className="text-fg font-semibold">
            {values.alternativeConversionFactor} {selectedUnitLabel}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
