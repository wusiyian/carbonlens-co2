// src/components/ToastProvider.tsx
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                duration: 2000,  // 2秒自动消失
                style: {
                    background: '#2f855a',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    fontSize: '1rem',
                },
                success: {
                    iconTheme: {
                        primary: 'white',
                        secondary: '#2f855a',
                    },
                },
                error: {
                    style: {
                        background: '#c53030',
                    },
                },
            }}
        />
    );
}