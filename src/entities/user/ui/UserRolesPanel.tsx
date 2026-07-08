import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAssignRolesToUserMutation,
  useGetAllRolesQuery,
  useGetUserRolesQuery,
} from '@entities/user/api/userApi';
import { Button } from '@shared/ui/Button';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type UserRolesPanelProps = {
  userId: string;
};

export function UserRolesPanel({ userId }: UserRolesPanelProps) {
  const { t } = useTranslation();

  const { data: userRolesData } = useGetUserRolesQuery(userId);
  const { data: allRolesData } = useGetAllRolesQuery();
  const [assignRoles, { isLoading: isSaving }] = useAssignRolesToUserMutation();

  const assignedRoles = useMemo(
    () => userRolesData?.data ?? [],
    [userRolesData],
  );
  const allRoles = useMemo(() => allRolesData?.data ?? [], [allRolesData]);

  const roleOptions = useMemo<SelectOption[]>(
    () => allRoles.map((role) => ({ label: role.name, value: role.name })),
    [allRoles],
  );

  const [draftRoleNames, setDraftRoleNames] = useState<string[] | null>(null);
  const currentRoleNames = useMemo(
    () => assignedRoles.map((role) => role.name),
    [assignedRoles],
  );
  const selectedRoleNames = draftRoleNames ?? currentRoleNames;

  const isDirty = useMemo(() => {
    if (!draftRoleNames) return false;
    if (draftRoleNames.length !== currentRoleNames.length) return true;
    return draftRoleNames.some((name) => !currentRoleNames.includes(name));
  }, [draftRoleNames, currentRoleNames]);

  const handleSave = async () => {
    try {
      await assignRoles({ userId, roleNames: selectedRoleNames }).unwrap();
      notify.success(t('message.saved'));
      setDraftRoleNames(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg flex items-center gap-1.5 text-sm font-semibold">
          <span className="text-fg-muted flex items-center">
            <ShieldIcon size={14} />
          </span>
          {t('user.rolesTitle')}
        </span>
        {isDirty && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDraftRoleNames(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" isLoading={isSaving} onClick={handleSave}>
              {t('common.save')}
            </Button>
          </div>
        )}
      </div>
      <Select
        isMulti
        options={roleOptions}
        value={roleOptions.filter((option) =>
          selectedRoleNames.includes(String(option.value)),
        )}
        onChange={(selected) =>
          setDraftRoleNames(
            (selected as SelectOption[]).map((option) => String(option.value)),
          )
        }
      />
    </div>
  );
}
