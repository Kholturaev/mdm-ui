import { useTranslation } from 'react-i18next';
import { NomenclatureTable } from '@widgets/nomenclature-table/ui/NomenclatureTable';
import { usePageTitle } from '@shared/lib/pageTitle';

export function NomenclaturePage() {
  const { t } = useTranslation();
  usePageTitle(t('product.title'));

  return (
    <div className="h-full">
      <NomenclatureTable />
    </div>
  );
}
