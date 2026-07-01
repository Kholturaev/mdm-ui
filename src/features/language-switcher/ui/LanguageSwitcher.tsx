import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';

const LANGUAGES = [
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="border-border flex rounded-md border p-0.5 text-xs">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            'rounded px-2 py-1 font-medium transition-colors',
            i18n.language === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
