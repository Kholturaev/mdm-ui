import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/store';
import { setAuthenticated } from '@app/store/auth/authSlice';
import { Button } from '@shared/ui/Button';
import { FormInput, FormPasswordInput } from '@shared/ui/form';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (_values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: wire up to the real auth endpoint once the backend contract is available.
      dispatch(setAuthenticated(true));
      navigate('/dealers');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-80 flex-col gap-4"
    >
      <FormInput
        name="email"
        control={control}
        label={t('auth.email')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormPasswordInput
        name="password"
        control={control}
        label={t('auth.password')}
        required
        rules={{ required: t('common.required') }}
      />
      <Button type="submit" isLoading={isSubmitting} fullWidth>
        {t('auth.login')}
      </Button>
    </form>
  );
}
