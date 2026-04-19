import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({ 
    monthlyBudget: 12000, 
    monthlySalary: 0, 
    currency: '₹', 
    dateFormat: 'dd/MM/yyyy' 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSettings({ monthlyBudget: 12000, monthlySalary: 0, currency: '₹', dateFormat: 'dd/MM/yyyy' });
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      const defaults = { monthlyBudget: 12000, monthlySalary: 0, currency: '₹', dateFormat: 'dd/MM/yyyy' };
      if (docSnap.exists() && docSnap.data().settings) {
        setSettings({ ...defaults, ...docSnap.data().settings });
      } else {
        setSettings(defaults);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const updateSettings = useCallback(async (newSettings) => {
    if (!currentUser) return;
    const merged = { ...settings, ...newSettings };
    await setDoc(doc(db, 'users', currentUser.uid), { settings: merged }, { merge: true });
  }, [currentUser, settings]);

  /**
   * Global Currency Formatter
   * @param {number|string} amount - The amount to format
   * @param {boolean} includeSymbol - Whether to prefix with the currency symbol
   */
  const formatCurrency = useCallback((amount, includeSymbol = true) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = (num || 0).toLocaleString('en-IN');
    return includeSymbol ? `${settings.currency}${formatted}` : formatted;
  }, [settings.currency]);

  const value = {
    settings,
    updateSettings,
    formatCurrency,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
