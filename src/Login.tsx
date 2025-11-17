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
			const res = await fetch('https://twistin-web.onrender.com/api/login', {
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
		<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
			<form onSubmit={handleSubmit} style={{
				background:'#fff',
				borderRadius:'16px',
				boxShadow:'0 2px 16px rgba(0,0,0,0.08)',
				padding:'2.5rem 2rem',
				minWidth:'320px',
				maxWidth:'360px',
				width:'100%',
				display:'flex',
				flexDirection:'column',
				gap:'1.2rem',
				fontFamily:'inherit'
			}}>
				<h2 style={{textAlign:'center',marginBottom:'0.2rem',fontSize:'1.3rem',fontWeight:700}}>Panel de administración</h2>
				<div style={{textAlign:'center',color:'#888',fontSize:'0.95rem',marginBottom:'0.5rem'}}>Inicia sesión para gestionar el portfolio.</div>
				<div style={{display:'flex',flexDirection:'column',gap:'0.7rem'}}>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Usuario
						<input type="text" value={username} onChange={e => setUsername(e.target.value)}
							style={{width:'100%',marginTop:'0.3rem',padding:'0.5rem',borderRadius:'6px',border:'1px solid #ddd',fontSize:'1rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Contraseña
						<input type="password" value={password} onChange={e => setPassword(e.target.value)}
							style={{width:'100%',marginTop:'0.3rem',padding:'0.5rem',borderRadius:'6px',border:'1px solid #ddd',fontSize:'1rem'}} />
					</label>
				</div>
				<button type="submit" style={{
					background:'#222',color:'#fff',border:'none',borderRadius:'6px',padding:'0.7rem',fontWeight:600,fontSize:'1rem',cursor:'pointer',marginTop:'0.5rem'
				}}>Entrar</button>
				{error && <div style={{color:'red',textAlign:'center',marginTop:'0.5rem'}}>{error}</div>}
			</form>
		</div>
	);
}

export default Login;
