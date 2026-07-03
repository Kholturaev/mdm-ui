import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IRole, RoleFormValues } from '@entities/role/model/types';
import { toRoleFormValues } from '@entities/role/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type RoleFormProps = {
  role?: IRole;
  isSubmitting: boolean;
  onSubmit: (values: RoleFormValues) => void;
  onCancel: () => void;
};

export function RoleForm({
  role,
  isSubmitting,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<RoleFormValues>({
    defaultValues: toRoleFormValues(role),
  });

  useEffect(() => {
    reset(toRoleFormValues(role));
  }, [role, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('role.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormTextarea
        name="description"
        control={control}
        label={t('role.description')}
        rows={3}
      />

      {!role && (
        <p className="text-fg-muted text-xs">
          {t('role.permissionsAfterCreateHint')}
        </p>
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
