import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from '../firebase';

// Helper: Compress Image using Canvas API
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output compressed base64
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export function useFirestore(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file, path = 'receipts') => {
    setLoading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const isPdf = fileExt === 'pdf';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${isPdf ? 'pdf' : 'jpg'}`;
      const storageRef = ref(storage, `${path}/${fileName}`);

      let downloadUrl = '';

      if (isPdf) {
        // Upload PDF directly as bytes
        const snapshot = await uploadBytes(storageRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Compress Image Data URL and upload as string
        const compressedBase64 = await compressImage(file, 1200, 0.8);
        const snapshot = await uploadString(storageRef, compressedBase64, 'data_url');
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      setLoading(false);
      return downloadUrl;
    } catch (err) {
      console.error('File Upload Error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
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
