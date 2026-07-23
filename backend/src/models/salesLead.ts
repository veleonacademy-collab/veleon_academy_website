export interface SalesLead {
  id?: number;
  name: string;
  email: string;
  whatsapp: string;
  selectedTrack: 'full' | 'excel_only';
  paymentTerm: 'full' | 'installment';
  amountDue: number;
  referralCode?: string | null;
  leadSource?: string;
  createdAt?: string;
}

export interface CreateSalesLeadPayload {
  id?: number;
  name: string;
  email: string;
  whatsapp: string;
  selectedTrack: 'full' | 'excel_only';
  paymentTerm: 'full' | 'installment';
  amountDue: number;
  referralCode?: string | null;
  leadSource?: string;
}
