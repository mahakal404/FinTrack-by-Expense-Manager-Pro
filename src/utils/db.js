import localforage from 'localforage';

// Configure localForage to use IndexedDB as the primary driver for persistence
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'FinTrack-Expense-Manager',
  version: 1.0,
  storeName: 'receipts', // Dedicated store for receipt blobs
  description: 'Local storage for receipt PDFs and images used as an alternative to Firebase Storage'
});

export default localforage;
