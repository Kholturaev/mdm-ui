import i18n from 'i18next';
import type { ApiException } from './type';

export function parseApiError(err: ApiException | undefined | null): string {
  if (!err) return i18n.t('message.error');

  if (err.fields && Object.keys(err.fields).length > 0) {
    return Object.values(err.fields).join(', ');
  }

  const body = err.data as { message?: string; error?: string } | undefined;
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
  }

  const status = err.status;
  if (status === 0 || status === undefined)
    return i18n.t('message.networkError');
  if (status === 403) return i18n.t('message.permissionDenied');
  if (status === 404) return i18n.t('message.notFound');
  if (status === 400 || status === 422)
    return i18n.t('message.validationError');
  if (status >= 500) return i18n.t('message.serverError');

  return err.message || i18n.t('message.error');
}

export function extractFieldErrors(
  body: unknown,
): Record<string, string> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const obj = body as Record<string, unknown>;

  if (obj.fields && typeof obj.fields === 'object') {
    return obj.fields as Record<string, string>;
  }

  const errors = obj.errors;
  if (Array.isArray(errors)) {
    const map: Record<string, string> = {};
    errors.forEach((e) => {
      if (e && typeof e === 'object' && 'field' in e && 'message' in e) {
        map[String((e as { field: unknown }).field)] = String(
          (e as { message: unknown }).message,
        );
      }
    });
    return Object.keys(map).length > 0 ? map : undefined;
  }
  if (errors && typeof errors === 'object') {
    return errors as Record<string, string>;
  }

  return undefined;
}
