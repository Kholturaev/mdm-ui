import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';

type AddMoreLinkProps = {
  onClick: () => void;
  className?: string;
};

/** "+ yana qo'shish" affordance shown under a reference select — opens that entity's quick-create modal instead of sending the user off to a separate management page. */
export function AddMoreLink({ onClick, className }: AddMoreLinkProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-primary self-end text-xs font-medium hover:underline',
        className,
      )}
    >
      + {t('common.addMore')}
    </button>
  );
}
