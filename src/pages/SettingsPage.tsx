import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@app/store';
import { setColorTheme, setTheme } from '@app/store/ui/uiSlice';
import type { ColorTheme, ThemeMode } from '@app/store/ui/uiSlice';
import { Card, CardHeader } from '@shared/ui/Card';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { MoonIcon, SunIcon } from '@shared/ui/icons/SunMoonIcon';
import { SettingsIcon } from '@shared/ui/icons/SettingsIcon';
import { SlidersIcon } from '@shared/ui/icons/SlidersIcon';
import { cn } from '@shared/lib/cn';

const THEME_MODES: { value: ThemeMode; labelKey: string; icon?: ReactNode }[] =
  [
    { value: 'light', labelKey: 'settings.modeLight', icon: <SunIcon /> },
    { value: 'dark', labelKey: 'settings.modeDark', icon: <MoonIcon /> },
    { value: 'system', labelKey: 'settings.modeSystem' },
  ];

const COLOR_THEMES: {
  value: ColorTheme;
  labelKey: string;
  descKey: string;
  swatches: { bg: string; surface: string; primary: string };
}[] = [
  {
    value: 'default',
    labelKey: 'settings.themeDefault',
    descKey: 'settings.themeDefaultDesc',
    swatches: { bg: '#f7f7f8', surface: '#ffffff', primary: '#18181b' },
  },
  {
    value: 'burgundy',
    labelKey: 'settings.themeBurgundy',
    descKey: 'settings.themeBurgundyDesc',
    swatches: { bg: '#fcf6f7', surface: '#ffffff', primary: '#9d2449' },
  },
  {
    value: 'navy',
    labelKey: 'settings.themeNavy',
    descKey: 'settings.themeNavyDesc',
    swatches: { bg: '#f6f8fb', surface: '#ffffff', primary: '#1e4fa3' },
  },
];

export function SettingsPage() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);

  return (
    <div className="wide:max-w-3xl wide:mx-auto flex h-full w-full flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-fg text-xl font-semibold">{t('settings.title')}</h1>

      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<SettingsIcon size={15} />}
          title={t('settings.appearance')}
          subtitle={t('settings.appearanceHint')}
        />

        <div>
          <p className="text-fg-muted mb-2 text-xs font-medium">
            {t('settings.displayMode')}
          </p>
          <div className="border-border bg-surface-hover inline-flex items-center gap-0.5 rounded-md border p-0.5">
            {THEME_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => dispatch(setTheme(mode.value))}
                className={cn(
                  'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors',
                  theme === mode.value
                    ? 'bg-surface text-fg shadow-sm'
                    : 'text-fg-muted hover:text-fg',
                )}
              >
                {mode.icon}
                {t(mode.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<SlidersIcon size={15} />}
          title={t('settings.colorTheme')}
          subtitle={t('settings.colorThemeHint')}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {COLOR_THEMES.map((option) => {
            const isSelected = colorTheme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => dispatch(setColorTheme(option.value))}
                className={cn(
                  'border-border relative flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors',
                  isSelected
                    ? 'border-primary ring-primary/20 ring-2'
                    : 'hover:bg-surface-hover',
                )}
              >
                {isSelected && (
                  <span className="bg-primary text-primary-foreground absolute top-3 right-3 flex size-5 items-center justify-center rounded-full">
                    <CheckIcon size={11} />
                  </span>
                )}
                <div className="border-border flex overflow-hidden rounded-md border">
                  <span
                    className="h-10 flex-1"
                    style={{ backgroundColor: option.swatches.bg }}
                  />
                  <span
                    className="h-10 flex-1"
                    style={{ backgroundColor: option.swatches.surface }}
                  />
                  <span
                    className="h-10 flex-1"
                    style={{ backgroundColor: option.swatches.primary }}
                  />
                </div>
                <div>
                  <p className="text-fg text-sm font-semibold">
                    {t(option.labelKey)}
                  </p>
                  <p className="text-fg-muted mt-0.5 text-xs">
                    {t(option.descKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
