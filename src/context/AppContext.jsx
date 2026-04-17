import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#10b981', isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'Car', color: '#3b82f6', isDefault: true },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
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

    // Expenses
    const qExpenses = query(collection(db, 'expenses'), where("uid", "==", uid));
    unsubscribes.push(onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Salary
    const qSalary = query(collection(db, 'salary'), where("uid", "==", uid));
    unsubscribes.push(onSnapshot(qSalary, (snapshot) => {
      setSalary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Goals
    const qGoals = query(collection(db, 'goals'), where("uid", "==", uid));
    unsubscribes.push(onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Custom Categories
    const qCategories = query(collection(db, 'customCategories'), where("uid", "==", uid));
    unsubscribes.push(onSnapshot(qCategories, (snapshot) => {
      setCustomCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Settings
    unsubscribes.push(onSnapshot(doc(db, 'settings', uid), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...docSnap.data(), uid });
      } else {
        setSettings({ monthlyBudget: 12000, currency: '₹' });
      }
    }));

    // Resolve initial data loading splash after a brief moment to allow collections to fetch
    const timer = setTimeout(() => setLoadingData(false), 800);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, [currentUser]);

  // CRUD Actions
  const addExpense = useCallback(async (expense) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'expenses'), { ...expense, uid: currentUser.uid, createdAt: new Date().toISOString() });
  }, [currentUser]);

  const updateExpense = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'expenses', id), { ...data, updatedAt: new Date().toISOString() });
  }, []);

  const deleteExpense = useCallback(async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  }, []);

  const addSalary = useCallback(async (sal) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'salary'), { ...sal, uid: currentUser.uid, createdAt: new Date().toISOString() });
  }, [currentUser]);

  const updateSalary = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'salary', id), { ...data, updatedAt: new Date().toISOString() });
  }, []);

  const deleteSalary = useCallback(async (id) => {
    await deleteDoc(doc(db, 'salary', id));
  }, []);

  const addGoal = useCallback(async (goal) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'goals'), { ...goal, uid: currentUser.uid, createdAt: new Date().toISOString() });
  }, [currentUser]);

  const updateGoal = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'goals', id), { ...data, updatedAt: new Date().toISOString() });
  }, []);

  const deleteGoal = useCallback(async (id) => {
    await deleteDoc(doc(db, 'goals', id));
  }, []);

  const addCategory = useCallback(async (category) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'customCategories'), { ...category, uid: currentUser.uid });
  }, [currentUser]);

  const deleteCategory = useCallback(async (id) => {
    await deleteDoc(doc(db, 'customCategories', id));
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    if (!currentUser) return;
    const merged = { ...settings, ...newSettings, uid: currentUser.uid };
    await setDoc(doc(db, 'settings', currentUser.uid), merged);
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
