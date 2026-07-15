import type { IExternalSystem, ExternalSystemFormValues } from './types';

const EMPTY_VALUES: ExternalSystemFormValues = {
  name: '',
  description: '',
  url: '',
  notificationUrl: '',
  authType: 'NONE',
  authCredentials: '',
  inboundCallbackUrl: '',
  inboundCallbackAuthType: 'NONE',
  inboundCallbackAuthCredentials: '',
};

export function toExternalSystemFormValues(
  entity?: IExternalSystem,
): ExternalSystemFormValues {
  if (!entity) return EMPTY_VALUES;
  return {
    name: entity.name,
    description: entity.description ?? '',
    url: entity.url,
    notificationUrl: entity.notificationUrl ?? '',
    authType: entity.authType ?? 'NONE',
    authCredentials: entity.authCredentials ?? '',
    inboundCallbackUrl: entity.inboundCallbackUrl ?? '',
    inboundCallbackAuthType: entity.inboundCallbackAuthType ?? 'NONE',
    inboundCallbackAuthCredentials: entity.inboundCallbackAuthCredentials ?? '',
  };
}

const MASKED_CREDENTIAL_PATTERN = /^\*{4}.{0,4}$/;

/** The backend returns stored secrets masked (e.g. `****`, `****ab12`) on GET — never round-trip that placeholder back on save, or it overwrites the real stored credential with the literal mask string. */
export function isMaskedCredential(value?: string): boolean {
  return typeof value === 'string' && MASKED_CREDENTIAL_PATTERN.test(value);
}
