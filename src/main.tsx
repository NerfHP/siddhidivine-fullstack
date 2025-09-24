import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App'; // Corrected Path, no extension
import '@/styles/index.css'; 
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient'; // Corrected Path, no extension
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/contexts/CartContext'; // Corrected Path, no extension

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={"pk_test_YWNjZXB0ZWQtZ2FyZmlzaC03NS5jbGVyay5hY2NvdW50cy5kZXYk"}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
            <CartProvider>
              <App />
              <Toaster position="bottom-right" />
            </CartProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);

