import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IUser, UserFormValues } from '@entities/user/model/types';
import { toUserFormValues } from '@entities/user/model/mapping';
import { useGetRolesQuery } from '@entities/role/api/roleApi';
import { Button } from '@shared/ui/Button';
import { Checkbox } from '@shared/ui/Checkbox';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { FormInput } from '@shared/ui/form';

type UserFormProps = {
  user?: IUser;
  isSubmitting: boolean;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
};

export function UserForm({
  user,
  isSubmitting,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<UserFormValues>({
    defaultValues: toUserFormValues(user),
  });

  useEffect(() => {
    reset(toUserFormValues(user));
  }, [user, reset]);

  const { data: rolesData } = useGetRolesQuery({ page: 0, size: 100 });
  const roleOptions = useMemo<SelectOption[]>(
    () =>
      (rolesData?.data.data ?? []).map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [rolesData],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="firstName"
          control={control}
          label={t('user.firstName')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormInput
          name="lastName"
          control={control}
          label={t('user.lastName')}
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="username"
          control={control}
          label={t('user.username')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormInput
          name="email"
          control={control}
          label={t('user.email')}
          type="email"
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <Controller
        name="roleIds"
        control={control}
        render={({ field }) => (
          <Select
            isMulti
            label={t('user.roles')}
            options={roleOptions}
            value={roleOptions.filter((option) =>
              field.value.includes(Number(option.value)),
            )}
            onChange={(selected) =>
              field.onChange(
                (selected as SelectOption[]).map((option) =>
                  Number(option.value),
                ),
              )
            }
          />
        )}
      />

      <Controller
        name="status"
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Checkbox
            label={t('user.active')}
            checked={value === 'ACTIVE'}
            onChange={(event) =>
              onChange(event.target.checked ? 'ACTIVE' : 'INACTIVE')
            }
            onBlur={onBlur}
            ref={ref}
          />
        )}
      />

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
