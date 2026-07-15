import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacteristicsTree } from '@widgets/characteristics-tree/ui/CharacteristicsTree';
import { CharacteristicsPanel } from '@widgets/characteristics-panel/ui/CharacteristicsPanel';
import { DynamicCharacteristicsPanel } from '@widgets/dynamic-characteristics-panel/ui/DynamicCharacteristicsPanel';
import { Tabs } from '@shared/ui/Tabs';

type CharacteristicsTab = 'characteristics' | 'dynamicTables';

export function CharacteristicsPage() {
  const { t } = useTranslation();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [activeTab, setActiveTab] =
    useState<CharacteristicsTab>('characteristics');

  return (
    <div className="flex h-full">
      <div className="bg-surface border-border w-88 shrink-0 border-r">
        <CharacteristicsTree
          selectedTypeId={selectedTypeId}
          selectedGroupId={selectedGroupId}
          onSelect={(typeId, groupId) => {
            setSelectedTypeId(typeId);
            setSelectedGroupId(groupId);
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Tabs
          items={[
            { key: 'characteristics', label: t('characteristic.tabLabel') },
            {
              key: 'dynamicTables',
              label: t('dynamicCharacteristic.tabLabel'),
            },
          ]}
          value={activeTab}
          onChange={(key) => setActiveTab(key as CharacteristicsTab)}
          className="bg-surface px-4"
        />
        <div className="min-h-0 flex-1">
          {activeTab === 'characteristics' ? (
            <CharacteristicsPanel
              typeId={selectedTypeId}
              groupId={selectedGroupId}
            />
          ) : (
            <DynamicCharacteristicsPanel
              typeId={selectedTypeId}
              groupId={selectedGroupId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
