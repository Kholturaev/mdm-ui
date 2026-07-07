import { useTranslation } from 'react-i18next';
import { LoginForm } from '@features/auth-login/ui/LoginForm';
import { ThemeToggle } from '@features/theme-toggle/ui/ThemeToggle';
import { LanguageSwitcher } from '@features/language-switcher/ui/LanguageSwitcher';
import { Card } from '@shared/ui/Card';
import { GaugeIcon } from '@shared/ui/icons/GaugeIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { BuildingIcon } from '@shared/ui/icons/BuildingIcon';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';

const FEATURES = [
  { key: 'analytics', Icon: GaugeIcon },
  { key: 'nomenclature', Icon: LayersIcon },
  { key: 'dealers', Icon: BuildingIcon },
  { key: 'access', Icon: ShieldIcon },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0b0f0d]">
        <img
          src="/akfa-logo-white.png"
          alt="AKFA Group"
          className="h-4 w-auto"
        />
      </span>
      {!compact && (
        <span className="text-sm font-semibold tracking-[0.2em] text-white/70">
          MDM
        </span>
      )}
    </div>
  );
}

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-bg flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0b0f0d] p-12 text-white lg:flex xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#22c55e] opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#22c55e] opacity-10 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <img
            src="/akfa-logo-white.png"
            alt="AKFA Group"
            className="h-8 w-auto"
          />
          <span className="h-5 w-px bg-white/20" />
          <span className="text-sm font-semibold tracking-[0.2em] text-white/70">
            MDM
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            {t('auth.brandHeadline')}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {t('auth.brandSubtitle')}
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map(({ key, Icon }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#4ade80]">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {t(`auth.features.${key}.title`)}
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {t(`auth.features.${key}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {CURRENT_YEAR} AKFA Group. {t('auth.footerRights')}
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="lg:hidden">
            <BrandMark compact />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-7">
              <h2 className="text-fg text-2xl font-semibold">
                {t('auth.welcomeTitle')}
              </h2>
              <p className="text-fg-muted mt-1.5 text-sm">
                {t('auth.welcomeSubtitle')}
              </p>
            </div>

            <Card className="p-6 sm:p-7">
              <LoginForm />
            </Card>

            <p className="text-fg-muted mt-5 text-center text-xs">
              {t('auth.helpText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
