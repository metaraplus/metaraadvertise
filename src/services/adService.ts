import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Advertisement, Client, Quotation, Invoice, Sequence } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const adService = {
  // Clients
  async getClients() {
    try {
      const q = query(collection(db, 'clients'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'clients'); }
  },

  async addClient(client: Omit<Client, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'clients'), client);
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'clients'); }
  },

  async updateClient(id: string, updates: Partial<Client>) {
    try {
      await updateDoc(doc(db, 'clients', id), updates);
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `clients/${id}`); }
  },

  async deleteClient(id: string) {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `clients/${id}`); }
  },

  // Ads
  async getAds() {
    try {
      const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'ads'); }
  },

  async addAd(ad: Omit<Advertisement, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'ads'), {
        ...ad,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'ads'); }
  },

  async updateAd(id: string, updates: Partial<Advertisement>) {
    try {
      await updateDoc(doc(db, 'ads', id), updates);
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `ads/${id}`); }
  },

  async deleteAd(id: string) {
    try {
      await deleteDoc(doc(db, 'ads', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `ads/${id}`); }
  },

  // Quotation Number Generator
  async getNextQuotationNumber() {
    const sequenceRef = doc(db, 'sequences', 'main');
    const currentYear = new Date().getFullYear();
    
    return await runTransaction(db, async (transaction) => {
      const seqDoc = await transaction.get(sequenceRef);
      let data: Sequence;
      
      if (!seqDoc.exists()) {
        data = { id: 'main', quotationCount: 1, invoiceCount: 0, year: currentYear };
        transaction.set(sequenceRef, data);
      } else {
        const existingData = seqDoc.data() as Sequence;
        if (existingData.year !== currentYear) {
          data = { ...existingData, quotationCount: 1, year: currentYear };
        } else {
          data = { ...existingData, quotationCount: existingData.quotationCount + 1 };
        }
        transaction.update(sequenceRef, { quotationCount: data.quotationCount, year: currentYear });
      }
      
      // Format: 186/METARA/VIII/2025
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const month = romanMonths[new Date().getMonth()];
      return `${String(data.quotationCount).padStart(3, '0')}/METARA/${month}/${currentYear}`;
    });
  },

  // Invoice Number Generator
  async getNextInvoiceNumber() {
    const sequenceRef = doc(db, 'sequences', 'main');
    const currentYear = new Date().getFullYear();
    
    return await runTransaction(db, async (transaction) => {
      const seqDoc = await transaction.get(sequenceRef);
      let data: Sequence;
      
      if (!seqDoc.exists()) {
        data = { id: 'main', quotationCount: 0, invoiceCount: 1, year: currentYear };
        transaction.set(sequenceRef, data);
      } else {
        const existingData = seqDoc.data() as Sequence;
        if (existingData.year !== currentYear) {
          data = { ...existingData, invoiceCount: 1, year: currentYear };
        } else {
          data = { ...existingData, invoiceCount: existingData.invoiceCount + 1 };
        }
        transaction.update(sequenceRef, { invoiceCount: data.invoiceCount, year: currentYear });
      }
      
      // Format: 230/SPJ/METARA/IV/2026
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const month = romanMonths[new Date().getMonth()];
      return `${String(data.invoiceCount).padStart(3, '0')}/SPJ/METARA/${month}/${currentYear}`;
    });
  },

  // Save Quotation
  async saveQuotation(quotation: Omit<Quotation, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'quotations'), quotation);
      await updateDoc(doc(db, 'ads', quotation.adId), { 
        quotationId: docRef.id,
        status: 'Quotation Sent'
      });
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'quotations'); }
  },

  // Save Invoice
  async saveInvoice(invoice: Omit<Invoice, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'invoices'), invoice);
      await updateDoc(doc(db, 'ads', invoice.adId), { 
        invoiceId: docRef.id,
        status: 'Invoiced'
      });
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'invoices'); }
  },

  // Document Database
  async getQuotations() {
    try {
      const q = query(collection(db, 'quotations'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'quotations'); }
  },

  async updateQuotation(id: string, updates: Partial<Quotation>) {
    try {
      await updateDoc(doc(db, 'quotations', id), updates);
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `quotations/${id}`); }
  },

  async deleteQuotation(id: string) {
    try {
      await deleteDoc(doc(db, 'quotations', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `quotations/${id}`); }
  },

  async getInvoices() {
    try {
      const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'invoices'); }
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    try {
      await updateDoc(doc(db, 'invoices', id), updates);
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `invoices/${id}`); }
  },

  async deleteInvoice(id: string) {
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `invoices/${id}`); }
  }
};
