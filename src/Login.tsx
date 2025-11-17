import { useState } from 'react';
import { buildApiUrl } from '../backendConfig';

interface LoginProps {
	onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		try {
			const res = await fetch(buildApiUrl('/login'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await res.json();
			if (res.ok && data.token) {
				onLogin(data.token);
			} else {
				setError(data.error || 'Login failed');
			}
		} catch {
			setError('Error de conexión');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Login administrador</h2>
			<label>
				Usuario:
				<input type="text" value={username} onChange={e => setUsername(e.target.value)} />
			</label>
			<label>
				Contraseña:
				<input type="password" value={password} onChange={e => setPassword(e.target.value)} />
			</label>
			<button type="submit">Entrar</button>
			{error && <div style={{color:'red'}}>{error}</div>}
		</form>
	);
}

export default Login;
