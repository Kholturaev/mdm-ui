import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/store';
import { login } from '@app/store/auth/authSlice';
import { Button } from '@shared/ui/Button';
import { FormInput, FormPasswordInput } from '@shared/ui/form';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useSignInMutation } from '../api/authApi';
import type { SignInRequest } from '../api/authApi';

export function LoginForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [signIn, { isLoading }] = useSignInMutation();

  const { control, handleSubmit, setError } = useForm<SignInRequest>({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: SignInRequest) => {
    try {
      await signIn(values).unwrap();
      dispatch(login({ username: values.username }));
      navigate('/analytics', { replace: true });
    } catch (error) {
      const message =
        parseApiError(error as ApiException) || t('auth.loginFailed');
      notify.error(message);
      setError('password', { type: 'custom', message: t('auth.loginFailed') });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-80 flex-col gap-4"
    >
      <FormInput
        name="username"
        control={control}
        label={t('auth.username')}
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
      <Button type="submit" isLoading={isLoading} fullWidth>
        {t('auth.login')}
      </Button>
    </form>
  );
}
