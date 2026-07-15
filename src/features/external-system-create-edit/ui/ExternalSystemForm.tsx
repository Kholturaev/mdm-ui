import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  AuthType,
  IExternalSystem,
  ExternalSystemFormValues,
} from '@entities/external-system/model/types';
import {
  toExternalSystemFormValues,
  isMaskedCredential,
} from '@entities/external-system/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormSelect, FormTextarea } from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';

const AUTH_TYPES: AuthType[] = ['NONE', 'API_KEY', 'BASIC_AUTH', 'BEARER'];

type ExternalSystemFormProps = {
  entity?: IExternalSystem;
  isSubmitting: boolean;
  onSubmit: (values: ExternalSystemFormValues) => void;
  onCancel: () => void;
};

export function ExternalSystemForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: ExternalSystemFormProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = useForm<ExternalSystemFormValues>({
    defaultValues: toExternalSystemFormValues(entity),
  });

  useEffect(() => {
    reset(toExternalSystemFormValues(entity));
  }, [entity, reset]);

  const authType = useWatch({ control, name: 'authType' });
  const inboundCallbackAuthType = useWatch({
    control,
    name: 'inboundCallbackAuthType',
  });

  const authTypeOptions: SelectOption[] = AUTH_TYPES.map((type) => ({
    label: t(`externalSystem.authTypeOption.${type}`),
    value: type,
  }));

  const submit = handleSubmit((values) => {
    const payload = { ...values };
    // Never resend a masked placeholder (e.g. "****ab12") — it would
    // overwrite the real stored secret with the literal mask string.
    if (
      !dirtyFields.authCredentials &&
      isMaskedCredential(payload.authCredentials)
    ) {
      delete payload.authCredentials;
    }
    if (
      !dirtyFields.inboundCallbackAuthCredentials &&
      isMaskedCredential(payload.inboundCallbackAuthCredentials)
    ) {
      delete payload.inboundCallbackAuthCredentials;
    }
    onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('externalSystem.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormTextarea
        name="description"
        control={control}
        label={t('externalSystem.description')}
      />

      <FormInput
        name="url"
        control={control}
        label={t('externalSystem.url')}
        required
        rules={{ required: t('common.required') }}
      />

      <fieldset className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <legend className="text-fg px-1 text-xs font-semibold">
          {t('externalSystem.outboundSectionTitle')}
        </legend>

        <FormInput
          name="notificationUrl"
          control={control}
          label={t('externalSystem.notificationUrl')}
        />

        <FormSelect
          name="authType"
          control={control}
          options={authTypeOptions}
          label={t('externalSystem.authType')}
        />

        {authType !== 'NONE' && (
          <FormInput
            name="authCredentials"
            control={control}
            label={t('externalSystem.authCredentials')}
            placeholder={
              authType === 'BASIC_AUTH' ? 'username:password' : 'token / key'
            }
          />
        )}
      </fieldset>

      <fieldset className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <legend className="text-fg px-1 text-xs font-semibold">
          {t('externalSystem.inboundCallbackSectionTitle')}
        </legend>

        <FormInput
          name="inboundCallbackUrl"
          control={control}
          label={t('externalSystem.inboundCallbackUrl')}
          placeholder={t('externalSystem.inboundCallbackUrlPlaceholder')}
        />

        <FormSelect
          name="inboundCallbackAuthType"
          control={control}
          options={authTypeOptions}
          label={t('externalSystem.inboundCallbackAuthType')}
        />

        {inboundCallbackAuthType && inboundCallbackAuthType !== 'NONE' && (
          <FormInput
            name="inboundCallbackAuthCredentials"
            control={control}
            label={t('externalSystem.inboundCallbackAuthCredentials')}
            placeholder={
              inboundCallbackAuthType === 'BASIC_AUTH'
                ? 'username:password'
                : 'token / key'
            }
          />
        )}
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {entity ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
}
