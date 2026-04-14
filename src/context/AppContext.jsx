import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const AppContext = createContext();

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#10b981', isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'Car', color: '#3b82f6', isDefault: true },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
  { id: 'others', name: 'Others', icon: 'Package', color: '#64748b', isDefault: true },
];

const LOCAL_STORAGE_KEY = 'expenseManagerProData';

const getInitialState = () => {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      return {
        expenses: parsed.expenses || [],
        salary: parsed.salary || [],
        customCategories: parsed.customCategories || [],
        categories: [...DEFAULT_CATEGORIES, ...(parsed.customCategories || [])],
        goals: parsed.goals || [],
        settings: parsed.settings || { monthlyBudget: 12000, currency: '₹' },
        loading: false,
      };
    } catch (e) {
      console.error('Failed to parse local storage data', e);
    }
  }

  return {
    expenses: [],
    salary: [],
    customCategories: [],
    categories: DEFAULT_CATEGORIES,
    goals: [],
    settings: { monthlyBudget: 12000, currency: '₹' },
    loading: false,
  };
};

function appReducer(state, action) {
  let newState;
  switch (action.type) {
    case 'SET_EXPENSES':
      newState = { ...state, expenses: action.payload };
      break;
    case 'SET_SALARY':
      newState = { ...state, salary: action.payload };
      break;
    case 'SET_CATEGORIES':
      newState = {
        ...state,
        customCategories: action.payload,
        categories: [...DEFAULT_CATEGORIES, ...action.payload]
      };
      break;
    case 'SET_GOALS':
      newState = { ...state, goals: action.payload };
      break;
    case 'SET_SETTINGS':
      newState = { ...state, settings: { ...state.settings, ...action.payload } };
      break;
    default:
      return state;
  }

  // Persist to localStorage on every state change
  const dataToSave = {
    expenses: newState.expenses,
    salary: newState.salary,
    customCategories: newState.customCategories,
    goals: newState.goals,
    settings: newState.settings,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  // CRUD Actions
  const addExpense = useCallback(async (expense) => {
    const newExpense = { ...expense, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'SET_EXPENSES', payload: [newExpense, ...state.expenses] });
  }, [state.expenses]);

  const updateExpense = useCallback(async (id, data) => {
    const updated = state.expenses.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e);
    dispatch({ type: 'SET_EXPENSES', payload: updated });
  }, [state.expenses]);

  const deleteExpense = useCallback(async (id) => {
    const updated = state.expenses.filter(e => e.id !== id);
    dispatch({ type: 'SET_EXPENSES', payload: updated });
  }, [state.expenses]);

  const addSalary = useCallback(async (salary) => {
    const newSalary = { ...salary, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'SET_SALARY', payload: [newSalary, ...state.salary] });
  }, [state.salary]);

  const updateSalary = useCallback(async (id, data) => {
    const updated = state.salary.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s);
    dispatch({ type: 'SET_SALARY', payload: updated });
  }, [state.salary]);

  const deleteSalary = useCallback(async (id) => {
    const updated = state.salary.filter(s => s.id !== id);
    dispatch({ type: 'SET_SALARY', payload: updated });
  }, [state.salary]);

  const addGoal = useCallback(async (goal) => {
    const newGoal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'SET_GOALS', payload: [newGoal, ...state.goals] });
  }, [state.goals]);

  const updateGoal = useCallback(async (id, data) => {
    const updated = state.goals.map(g => g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g);
    dispatch({ type: 'SET_GOALS', payload: updated });
  }, [state.goals]);

  const deleteGoal = useCallback(async (id) => {
    const updated = state.goals.filter(g => g.id !== id);
    dispatch({ type: 'SET_GOALS', payload: updated });
  }, [state.goals]);

  const addCategory = useCallback(async (category) => {
    const newCategory = { ...category, id: generateId() };
    dispatch({ type: 'SET_CATEGORIES', payload: [...state.customCategories, newCategory] });
  }, [state.customCategories]);

  const deleteCategory = useCallback(async (id) => {
    const updated = state.customCategories.filter(c => c.id !== id);
    dispatch({ type: 'SET_CATEGORIES', payload: updated });
  }, [state.customCategories]);

  const updateSettings = useCallback(async (newSettings) => {
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  }, []);

  const value = {
    ...state,
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
