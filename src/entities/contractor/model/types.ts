export interface IContractor {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  inn: string;
  telegramNickName?: string;
  regionId?: number | null;
}
