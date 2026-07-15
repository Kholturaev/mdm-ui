import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IIntegrationConfig } from '@entities/external-system/model/types';
import { useExternalSystemOptions } from '@entities/external-system/lib/useExternalSystemOptions';
import { Button } from '@shared/ui/Button';
import { FormInput, FormSelect } from '@shared/ui/form';

type IntegrationConfigFormValues = {
  name: string;
  code: string;
  externalSystemId: number | null;
};

type IntegrationConfigFormProps = {
  entity: IIntegrationConfig;
  isSubmitting: boolean;
  onSubmit: (values: {
    name: string;
    code: string;
    externalSystemId: number;
  }) => void;
  onCancel: () => void;
};

/**
 * Metadata-only — name/code/external system. The actual `sections`/`mappings`
 * builder lives on the external system's own config page
 * (`ExternalSystemConfigPage`), not here — this quick-edit modal (reached
 * from the flat "Integration Configurations" list) only ever edits an
 * existing config's metadata; there is no create mode.
 */
export function IntegrationConfigForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: IntegrationConfigFormProps) {
  const { t } = useTranslation();
  const externalSystem = useExternalSystemOptions();
  const { control, handleSubmit, reset } = useForm<IntegrationConfigFormValues>(
    {
      defaultValues: {
        name: entity.name,
        code: entity.code,
        externalSystemId: entity.externalSystemId,
      },
    },
  );

  useEffect(() => {
    reset({
      name: entity.name,
      code: entity.code,
      externalSystemId: entity.externalSystemId,
    });
  }, [entity, reset]);

  const submit = handleSubmit((values) => {
    if (!values.externalSystemId) return;
    onSubmit({
      name: values.name,
      code: values.code,
      externalSystemId: values.externalSystemId,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('integrationConfig.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormInput
        name="code"
        control={control}
        label={t('integrationConfig.code')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormSelect
        name="externalSystemId"
        control={control}
        options={externalSystem.options}
        label={t('integrationConfig.externalSystem')}
        required
        isSearchable
        isLoading={externalSystem.isFetching}
        rules={{ required: t('common.required') }}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.update')}
        </Button>
      </div>
    </form>
  );
}
