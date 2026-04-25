export interface Client {
  id?: string;
  name: string;
  address: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export type AdStatus = 'Draft' | 'Quotation Sent' | 'Invoiced' | 'Paid' | 'Cancelled';

export interface Advertisement {
  id?: string;
  clientId: string;
  clientName: string; // Denormalized for easy listing
  serviceType: string;
  packageName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  period: string;
  status: AdStatus;
  createdAt: any;
  quotationId?: string;
  invoiceId?: string;
}

export interface Quotation {
  id?: string;
  adId: string;
  number: string;
  date: string;
  attachment: string;
  subject: string;
  contentMarkup: string;
  recipientInfo: string;
}

export interface Invoice {
  id?: string;
  adId: string;
  number: string;
  date: string;
  paymentStatus: 'Unpaid' | 'Paid';
  paidAt?: any;
  contentMarkup: string;
}

export interface Sequence {
  id: string; // e.g., 'main'
  quotationCount: number;
  invoiceCount: number;
  year: number;
}
