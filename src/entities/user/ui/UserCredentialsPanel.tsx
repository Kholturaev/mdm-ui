import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useChangeOwnPasswordMutation,
  useResetUserPasswordMutation,
} from '@entities/user/api/userApi';
import { Card, CardHeader } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { FormPasswordInput } from '@shared/ui/form';
import { LockIcon } from '@shared/ui/icons/LockIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type UserCredentialsPanelProps = {
  userId: string;
  isOwnProfile: boolean;
};

type ResetPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function AdminResetPasswordForm({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();
  const { control, handleSubmit, reset, getValues } =
    useForm<ResetPasswordValues>({
      defaultValues: { newPassword: '', confirmPassword: '' },
    });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await resetPassword({
        userId,
        newPassword: values.newPassword,
      }).unwrap();
      notify.success(t('message.saved'));
      reset({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-sm flex-col gap-4"
    >
      <FormPasswordInput
        name="newPassword"
        control={control}
        label={t('user.newPassword')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormPasswordInput
        name="confirmPassword"
        control={control}
        label={t('user.confirmPassword')}
        required
        rules={{
          required: t('common.required'),
          validate: (value) =>
            value === getValues('newPassword') || t('user.passwordMismatch'),
        }}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" isLoading={isLoading}>
          {t('user.resetPassword')}
        </Button>
      </div>
    </form>
  );
}

function ChangeOwnPasswordForm() {
  const { t } = useTranslation();
  const [changePassword, { isLoading }] = useChangeOwnPasswordMutation();
  const { control, handleSubmit, reset, getValues } =
    useForm<ChangePasswordValues>({
      defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      notify.success(t('message.saved'));
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-sm flex-col gap-4"
    >
      <FormPasswordInput
        name="currentPassword"
        control={control}
        label={t('user.currentPassword')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormPasswordInput
        name="newPassword"
        control={control}
        label={t('user.newPassword')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormPasswordInput
        name="confirmPassword"
        control={control}
        label={t('user.confirmPassword')}
        required
        rules={{
          required: t('common.required'),
          validate: (value) =>
            value === getValues('newPassword') || t('user.passwordMismatch'),
        }}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" isLoading={isLoading}>
          {t('user.changePassword')}
        </Button>
      </div>
    </form>
  );
}

export function UserCredentialsPanel({
  userId,
  isOwnProfile,
}: UserCredentialsPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader
        title={t('user.credentialsTitle')}
        subtitle={t('user.credentialsSubtitle')}
        icon={<LockIcon size={16} />}
      />
      {isOwnProfile ? (
        <ChangeOwnPasswordForm />
      ) : (
        <AdminResetPasswordForm userId={userId} />
      )}
    </Card>
  );
}
