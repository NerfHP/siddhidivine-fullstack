import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App'; // Corrected Path, no extension
import '@/styles/index.css'; 
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient'; // Corrected Path, no extension
import { AuthProvider } from '@/contexts/AuthContext'; // Corrected Path, no extension
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/contexts/CartContext'; // Corrected Path, no extension

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

