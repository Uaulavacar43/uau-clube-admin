import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthProvider';
import { NuqsAdapter } from 'nuqs/adapters/react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter> {/* Aquí está el único BrowserRouter necesario */}
			<NuqsAdapter>
				<AuthProvider>
					<App />
				</AuthProvider>
			</NuqsAdapter>
		</BrowserRouter>
	</React.StrictMode>
);
