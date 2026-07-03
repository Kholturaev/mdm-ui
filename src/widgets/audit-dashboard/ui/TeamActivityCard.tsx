import { useTranslation } from 'react-i18next';
import { useTeamActivity } from '@entities/audit/api/auditApi';
import { Card, CardHeader } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { UserIcon } from '@shared/ui/icons/UserIcon';

export function TeamActivityCard() {
  const { t } = useTranslation();
  const team = useTeamActivity(1);

  return (
    <Card>
      <CardHeader
        title={t('audit.team.title')}
        icon={<UserIcon size={16} />}
        action={
          <span className="text-fg-muted text-xs">{t('audit.team.today')}</span>
        }
      />

      {team.length === 0 ? (
        <p className="text-fg-muted py-4 text-center text-sm">
          {t('audit.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {team.map((item) => (
            <div
              key={item.actor.username}
              className="flex items-center gap-2.5"
            >
              <Avatar name={item.actor.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-sm font-medium">
                  {item.actor.fullName}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {item.roleName}
                </p>
              </div>
              <span className="text-fg-muted shrink-0 text-xs font-medium whitespace-nowrap">
                {t('audit.team.actionCount', { count: item.actionCount })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
