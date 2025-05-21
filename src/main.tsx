
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevent zooming on mobile double-tap in iOS
const setViewportMetaTags = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
  } else {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
};

// Run the viewport setup function
setViewportMetaTags();

// Create root and render the app
createRoot(document.getElementById("root")!).render(<App />);
