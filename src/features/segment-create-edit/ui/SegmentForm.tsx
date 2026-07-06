import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  ISegment,
  SegmentFormValues,
} from '@entities/segment/model/types';
import { toSegmentFormValues } from '@entities/segment/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput } from '@shared/ui/form';

type SegmentFormProps = {
  entity?: ISegment;
  isSubmitting: boolean;
  onSubmit: (values: SegmentFormValues) => void;
  onCancel: () => void;
};

/** Reusable across the product form's "+ yana qo'shish" quick-create and a future dedicated segment management page. */
export function SegmentForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: SegmentFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<SegmentFormValues>({
    defaultValues: toSegmentFormValues(entity),
  });

  useEffect(() => {
    reset(toSegmentFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('segment.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.create')}
        </Button>
      </div>
    </form>
  );
}
