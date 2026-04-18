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
      const fileExt = (file.name || '').split('.').pop().toLowerCase();
      const isPdf = fileExt === 'pdf';
      // Completely sanitize filename to prevent invalid paths
      const safeRandom = Math.random().toString(36).substring(2, 9);
      const safeTime = Date.now();
      const fileName = `${safeTime}_${safeRandom}.${isPdf ? 'pdf' : 'jpg'}`;
      
      const storageRef = ref(storage, `${path}/${fileName}`);

      let downloadUrl = '';

      if (isPdf) {
        // Upload PDF directly as bytes
        console.log(`[Firebase] Starting raw PDF upload to path: ${path}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Compress Image Data URL and upload as string
        try {
          console.log(`[Firebase] Starting Canvas compression for image...`);
          const compressedBase64 = await compressImage(file, 1200, 0.8);
          console.log(`[Firebase] Compression successful. Uploading as data_url...`);
          const snapshot = await uploadString(storageRef, compressedBase64, 'data_url');
          downloadUrl = await getDownloadURL(snapshot.ref);
        } catch (compressionErr) {
          console.error(`[Firebase] Canvas compression failed, falling back to RAW upload:`, compressionErr);
          console.log(`[Firebase] Starting RAW image upload to path: ${path}/${fileName}`);
          const snapshot = await uploadBytes(storageRef, file);
          downloadUrl = await getDownloadURL(snapshot.ref);
        }
      }

      console.log(`[Firebase] Upload successful! URL:`, downloadUrl);
      setLoading(false);
      return downloadUrl;
    } catch (err) {
      console.error('[Firebase Storage Upload Error]:', err?.code || 'Unknown Code', err?.message || err);
      // Construct a better message if it's a Firebase Error
      const finalMsg = err?.code ? `Firebase: ${err.message}` : err?.message || 'Unknown network error';
      setError(finalMsg);
      setLoading(false);
      throw new Error(finalMsg);
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
