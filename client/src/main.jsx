import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { LanguageProvider } from './context/LanguageContext';
import { VoiceNarratorProvider } from './context/VoiceNarratorContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <VoiceNarratorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </VoiceNarratorProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
