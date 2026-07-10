import { useState } from 'react';
import { useGetTypeOfNomenclaturesQuery } from '@entities/type-of-nomenclature/api/typeOfNomenclatureApi';
import { CharacteristicsTree } from '@widgets/characteristics-tree/ui/CharacteristicsTree';
import { CharacteristicsPanel } from '@widgets/characteristics-panel/ui/CharacteristicsPanel';

export function CharacteristicsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { data } = useGetTypeOfNomenclaturesQuery({ page: 0, size: 200 });
  const selectedType = data?.data?.data.find((t) => t.id === selectedTypeId);

  return (
    <div className="flex h-full">
      <div className="border-border w-72 shrink-0 border-r">
        <CharacteristicsTree
          selectedTypeId={selectedTypeId}
          selectedGroupId={selectedGroupId}
          onSelect={(typeId, groupId) => {
            setSelectedTypeId(typeId);
            setSelectedGroupId(groupId);
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <CharacteristicsPanel
          typeId={selectedTypeId}
          typeName={selectedType?.name}
          groupId={selectedGroupId}
        />
      </div>
    </div>
  );
}
