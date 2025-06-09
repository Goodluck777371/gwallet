
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Ensure clean initialization
const root = createRoot(container);

// Wrap in try-catch to handle any initialization errors
try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  // Fallback rendering without StrictMode
  root.render(<App />);
}
