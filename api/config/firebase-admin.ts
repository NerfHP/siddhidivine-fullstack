// api/config/firebase-admin.ts
import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), 'config', 'ServiceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: 'siddhi-divine'
  });
  
  console.log('Firebase Admin SDK initialized successfully');
}

export default admin;