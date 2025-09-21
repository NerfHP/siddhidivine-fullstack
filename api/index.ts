import app from './app.js';
import admin from 'firebase-admin';
// Make sure the path to your service account key is correct
import serviceAccount from './config/serviceAccountKey.json';

// --- INITIALIZE FIREBASE ADMIN SDK ---
// This block of code initializes the connection to your Firebase project.
// It uses the secure service account key you downloaded.
// It needs to run only once when the server starts.
if (!admin.apps.length) {
  admin.initializeApp({
    // --- FIX APPLIED HERE ---
    // We explicitly cast the imported JSON object to the ServiceAccount type
    // to satisfy TypeScript's strict type checking.
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

// Vercel handles the server creation and listening.
// We just need to export the configured Express app.
export default app;