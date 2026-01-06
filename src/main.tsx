import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

console.log('Main.tsx is executing');
try {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>,
    )
    console.log('Main.tsx render called successfully');
} catch (error) {
    console.error('CRITICAL RENDERING ERROR:', error);
    document.getElementById('root')!.innerHTML = `<div style="color: red; padding: 20px;"><h1>Critical Error</h1><pre>${error instanceof Error ? error.stack : String(error)}</pre></div>`;
}
