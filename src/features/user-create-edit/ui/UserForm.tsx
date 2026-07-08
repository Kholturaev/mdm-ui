import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IUser } from '@entities/user/model/types';
import { toUserFormValues } from '@entities/user/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormPasswordInput } from '@shared/ui/form';

export type UserFormSubmitValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  telegramNickName: string;
  password: string;
};

type UserFormProps = {
  user?: IUser;
  isSubmitting: boolean;
  onSubmit: (values: UserFormSubmitValues) => void;
  onCancel: () => void;
};

export function UserForm({
  user,
  isSubmitting,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(user);
  const { control, handleSubmit, reset } = useForm<UserFormSubmitValues>({
    defaultValues: { ...toUserFormValues(user), password: '' },
  });

  useEffect(() => {
    reset({ ...toUserFormValues(user), password: '' });
  }, [user, reset]);

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
          disabled={isEdit}
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

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="phone" control={control} label={t('user.phone')} />
        <FormInput
          name="telegramNickName"
          control={control}
          label={t('user.telegram')}
        />
      </div>

      {!isEdit && (
        <FormPasswordInput
          name="password"
          control={control}
          label={t('user.password')}
          required
          rules={{ required: t('common.required') }}
        />
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
