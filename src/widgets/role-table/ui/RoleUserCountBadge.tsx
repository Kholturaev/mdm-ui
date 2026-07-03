import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCountUsersByRole } from '@entities/user/api/userApi';
import { buildUsersLink } from '@shared/lib/accessLink';

type RoleUserCountBadgeProps = {
  roleId: number;
};

/** Own component (not an inline cell callback) so `useCountUsersByRole`'s hook call stays valid regardless of how many rows the table renders. */
export function RoleUserCountBadge({ roleId }: RoleUserCountBadgeProps) {
  const { t } = useTranslation();
  const count = useCountUsersByRole(roleId);

  return (
    <Link
      to={buildUsersLink({ roleId })}
      onClick={(event) => event.stopPropagation()}
      className="text-primary text-xs font-medium whitespace-nowrap hover:underline"
    >
      {t('role.userCount', { count })}
    </Link>
  );
}
