import { useState, useCallback } from 'react';
// Storage dependencies removed

export function useFirestore(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // uploadFile removed as per local-first refactor

  return { 
    add: async () => {}, // Placeholders preserved
    update: async () => {}, 
    remove: async () => {}, 
    loading, 
    error 
  };
}
