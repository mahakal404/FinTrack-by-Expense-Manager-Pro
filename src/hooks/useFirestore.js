import { useState, useCallback } from 'react';

export function useFirestore(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file, path) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLoading(false);
          resolve(reader.result); // Returns a base64 Data URL
        };
        reader.onerror = (err) => {
          setError(err);
          setLoading(false);
          reject(err);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        reject(err);
      }
    });
  }, []);

  // Return stubbed tracking for backwards compatibility
  return { 
    add: async () => {}, 
    update: async () => {}, 
    remove: async () => {}, 
    uploadFile, 
    loading, 
    error 
  };
}
