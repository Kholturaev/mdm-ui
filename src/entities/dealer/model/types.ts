export type Dealer = {
  id: number;
  name: string;
  description: string;
  dealerCode: string;
  discountRate: number | null;
  registeredAt: string | null;
  contactPhone: string;
  regionId: number | null;
  active: boolean;
};

/** Form-facing shape: `registeredAt` is a `Date` for the date picker. */
export type DealerFormValues = {
  name: string;
  description: string;
  dealerCode: string;
  discountRate: number | null;
  registeredAt: Date | null;
  contactPhone: string;
  regionId: number | null;
  active: boolean;
};

/** Wire shape sent to the API: `registeredAt` serialized back to an ISO string. */
export type DealerPayload = Omit<DealerFormValues, 'registeredAt'> & {
  registeredAt: string | null;
};

export type DealerListFilters = {
  name?: string;
};
