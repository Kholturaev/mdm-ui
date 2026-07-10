import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IUser } from '@entities/user/model/types';
import { toUserFormValues } from '@entities/user/model/mapping';
import { cn } from '@shared/lib/cn';
import { Button } from '@shared/ui/Button';
import { FormInput, FormPasswordInput, FormPhoneField } from '@shared/ui/form';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';

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

const INFO_STEP_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'telegramNickName',
] as const;

function StepIndicator({
  step,
  infoLabel,
  loginLabel,
}: {
  step: 1 | 2;
  infoLabel: string;
  loginLabel: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <StepBadge
        index={1}
        label={infoLabel}
        active={step === 1}
        done={step > 1}
      />
      <div
        className={cn(
          'h-px flex-1 transition-colors',
          step > 1 ? 'bg-primary' : 'bg-border',
        )}
      />
      <StepBadge
        index={2}
        label={loginLabel}
        active={step === 2}
        done={false}
      />
    </div>
  );
}

function StepBadge({
  index,
  label,
  active,
  done,
}: {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          done && 'bg-primary text-primary-foreground',
          active && 'bg-primary text-primary-foreground',
          !active && !done && 'bg-surface-hover text-fg-muted',
        )}
      >
        {done ? <CheckIcon size={12} /> : index}
      </div>
      <span
        className={cn(
          'text-sm font-medium whitespace-nowrap',
          active ? 'text-fg' : 'text-fg-muted',
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function UserForm({
  user,
  isSubmitting,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(user);
  const [step, setStep] = useState<1 | 2>(1);
  const { control, handleSubmit, reset, trigger } =
    useForm<UserFormSubmitValues>({
      defaultValues: { ...toUserFormValues(user), password: '' },
    });

  useEffect(() => {
    reset({ ...toUserFormValues(user), password: '' });
  }, [user, reset]);

  const handleNext = async () => {
    const valid = await trigger(INFO_STEP_FIELDS);
    if (valid) setStep(2);
  };

  const infoFields = (
    <div className="flex flex-col gap-4">
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
          name="email"
          control={control}
          label={t('user.email')}
          type="email"
          required
          rules={{ required: t('common.required') }}
        />
        <FormPhoneField
          name="phone"
          control={control}
          label={t('user.phone')}
        />
      </div>

      <FormInput
        name="telegramNickName"
        control={control}
        label={t('user.telegram')}
      />
    </div>
  );

  if (isEdit) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {infoFields}

        <FormInput
          name="username"
          control={control}
          label={t('user.username')}
          required
          disabled
          rules={{ required: t('common.required') }}
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <StepIndicator
        step={step}
        infoLabel={t('user.stepInfoTitle')}
        loginLabel={t('user.stepLoginTitle')}
      />

      {step === 1 ? (
        infoFields
      ) : (
        <div className="flex flex-col gap-4">
          <FormInput
            name="username"
            control={control}
            label={t('user.username')}
            required
            rules={{ required: t('common.required') }}
          />
          <FormPasswordInput
            name="password"
            control={control}
            label={t('user.password')}
            required
            rules={{ required: t('common.required') }}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onCancel : () => setStep(1)}
        >
          {step === 1 ? t('common.cancel') : t('common.previous')}
        </Button>
        {step === 1 ? (
          <Button type="button" onClick={handleNext}>
            {t('common.next')}
          </Button>
        ) : (
          <Button type="submit" isLoading={isSubmitting}>
            {t('common.save')}
          </Button>
        )}
      </div>
    </form>
  );
}
