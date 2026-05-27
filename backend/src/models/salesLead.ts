export interface SalesLead {
  id?: number;
  name: string;
  email: string;
  whatsapp: string;
  selectedTrack: 'full' | 'excel_only';
  paymentTerm: 'full' | 'installment';
  amountDue: number;
  createdAt?: string;
}

export interface CreateSalesLeadPayload {
  name: string;
  email: string;
  whatsapp: string;
  selectedTrack: 'full' | 'excel_only';
  paymentTerm: 'full' | 'installment';
  amountDue: number;
}
