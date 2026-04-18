import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

// Helper: Compress Image using Canvas API and return as Blob
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
        
        // Output compressed Blob directly
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, 'image/jpeg', quality);
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
      const fileExt = (file.name || '').split('.').pop().toLowerCase();
      const isPdf = fileExt === 'pdf';
      // Completely sanitize filename to prevent invalid paths
      const safeRandom = Math.random().toString(36).substring(2, 9);
      const safeTime = Date.now();
      const fileName = `${safeTime}_${safeRandom}.${isPdf ? 'pdf' : 'jpg'}`;
      
      // Building the ref using only the storage instance and the sanitized path
      const storageRef = ref(storage, `${path}/${fileName}`);

      let downloadUrl = '';

      if (isPdf) {
        // Upload PDF directly as bytes using the official SDK method
        console.log(`[Firebase SDK] Starting uploadBytes for PDF: ${path}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Handle Images with compression fallback
        try {
          console.log(`[Firebase SDK] Starting Canvas compression...`);
          const compressedBlob = await compressImage(file, 1200, 0.8);
          console.log(`[Firebase SDK] Compression successful. Starting uploadBytes...`);
          const snapshot = await uploadBytes(storageRef, compressedBlob);
          downloadUrl = await getDownloadURL(snapshot.ref);
        } catch (compressionErr) {
          console.error(`[Firebase SDK] Compression failed, falling back to original uploadBytes:`, compressionErr);
          const snapshot = await uploadBytes(storageRef, file);
          downloadUrl = await getDownloadURL(snapshot.ref);
        }
      }

      console.log(`[Firebase SDK] Upload successful! URL retrieved.`);
      setLoading(false);
      return downloadUrl;
    } catch (err) {
      console.error('[Firebase SDK Critical Error]:', err?.code || 'Unknown Code', err?.message || err);
      const finalMsg = err?.code ? `Firebase (${err.code}): ${err.message}` : err?.message || 'Unknown network error';
      setError(finalMsg);
      setLoading(false);
      throw new Error(finalMsg);
    }
  }, []);

  return { 
    add: async () => {}, 
    update: async () => {}, 
    remove: async () => {}, 
    uploadFile, 
    loading, 
    error 
  };
}
