import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const stripUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

const AppContext = createContext();

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#10b981', isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'Car', color: '#3b82f6', isDefault: true },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
  { id: 'mobile_recharge', name: 'Mobile Recharge', icon: 'Smartphone', color: '#06b6d4', isDefault: true },
  { id: 'ai_tools', name: 'AI & Digital Tools', icon: 'Sparkles', color: '#8b5cf6', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions & Premiums', icon: 'Repeat', color: '#f59e0b', isDefault: true },
  { id: 'others', name: 'Others', icon: 'Package', color: '#64748b', isDefault: true },
];

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [salary, setSalary] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({ monthlyBudget: 12000, currency: '₹' });
  const [loadingData, setLoadingData] = useState(true);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setSalary([]);
      setCustomCategories([]);
      setGoals([]);
      setSettings({ monthlyBudget: 12000, currency: '₹' });
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const uid = currentUser.uid;
    const unsubscribes = [];

    // Expenses (users/{uid}/expenses)
    const qExpenses = query(collection(db, 'users', uid, 'expenses'));
    unsubscribes.push(onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Salary (users/{uid}/salary)
    const qSalary = query(collection(db, 'users', uid, 'salary'));
    unsubscribes.push(onSnapshot(qSalary, (snapshot) => {
      setSalary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Goals (users/{uid}/goals)
    const qGoals = query(collection(db, 'users', uid, 'goals'));
    unsubscribes.push(onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Custom Categories (users/{uid}/customCategories)
    const qCategories = query(collection(db, 'users', uid, 'customCategories'));
    unsubscribes.push(onSnapshot(qCategories, (snapshot) => {
      setCustomCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Settings (users/{uid})
    unsubscribes.push(onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().settings) {
        setSettings(docSnap.data().settings);
      } else {
        setSettings({ monthlyBudget: 12000, currency: '₹' });
      }
    }));

    // Resolve initial data loading splash
    const timer = setTimeout(() => setLoadingData(false), 800);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, [currentUser]);

  // CRUD Actions
  const addExpense = useCallback(async (expense) => {
    if (!currentUser) return;
    try {
      const payload = stripUndefined({ ...expense, createdAt: new Date().toISOString() });
      await addDoc(collection(db, 'users', currentUser.uid, 'expenses'), payload);
    } catch (e) {
      console.error("Firestore Error (addExpense):", e);
    }
  }, [currentUser]);

  const updateExpense = useCallback(async (id, data) => {
    if (!currentUser) return;
    const payload = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    await updateDoc(doc(db, 'users', currentUser.uid, 'expenses', id), payload);
  }, [currentUser]);

  const deleteExpense = useCallback(async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'expenses', id));
  }, [currentUser]);

  const addSalary = useCallback(async (sal) => {
    if (!currentUser) return;
    try {
      const payload = stripUndefined({ ...sal, createdAt: new Date().toISOString() });
      await addDoc(collection(db, 'users', currentUser.uid, 'salary'), payload);
    } catch (e) { console.error("Firestore Error:", e); }
  }, [currentUser]);

  const updateSalary = useCallback(async (id, data) => {
    if (!currentUser) return;
    const payload = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    await updateDoc(doc(db, 'users', currentUser.uid, 'salary', id), payload);
  }, [currentUser]);

  const deleteSalary = useCallback(async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'salary', id));
  }, [currentUser]);

  const addGoal = useCallback(async (goal) => {
    if (!currentUser) return;
    try {
      const payload = stripUndefined({ ...goal, createdAt: new Date().toISOString() });
      await addDoc(collection(db, 'users', currentUser.uid, 'goals'), payload);
    } catch (e) { console.error("Firestore Error:", e); }
  }, [currentUser]);

  const updateGoal = useCallback(async (id, data) => {
    if (!currentUser) return;
    const payload = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    await updateDoc(doc(db, 'users', currentUser.uid, 'goals', id), payload);
  }, [currentUser]);

  const deleteGoal = useCallback(async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', id));
  }, [currentUser]);

  const addCategory = useCallback(async (category) => {
    if (!currentUser) return;
    try {
      const payload = stripUndefined({ ...category });
      await addDoc(collection(db, 'users', currentUser.uid, 'customCategories'), payload);
    } catch (e) { console.error("Firestore Error:", e); }
  }, [currentUser]);

  const deleteCategory = useCallback(async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'customCategories', id));
  }, [currentUser]);

  const updateSettings = useCallback(async (newSettings) => {
    if (!currentUser) return;
    const merged = { ...settings, ...newSettings };
    // Save under user's root document -> 'settings' map
    await setDoc(doc(db, 'users', currentUser.uid), { settings: merged }, { merge: true });
    setSettings(merged);
  }, [currentUser, settings]);

  const value = {
    expenses, salary, customCategories, categories, goals, settings, loading: loadingData,
    addExpense, updateExpense, deleteExpense,
    addSalary, updateSalary, deleteSalary,
    addGoal, updateGoal, deleteGoal,
    addCategory, deleteCategory, updateSettings,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
