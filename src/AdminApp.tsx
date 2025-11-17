import { useState, useEffect } from 'react';
import EventForm from './EventForm';
import Login from './Login';

interface Event {
	id: string;
	title: string;
	description: string;
	coverImage: {
		src: string;
		alt: string;
	};
	images: {
		src: string;
		alt: string;
	}[];
}

function AdminApp() {
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

	const BACKEND_URL = 'https://twistin-web.onrender.com';

	useEffect(() => {
		fetch(`${BACKEND_URL}/api/events`)
			.then((res) => res.json())
			.then((data) => setEvents(data));
	}, []);

	const handleLogin = (jwt: string) => {
		setToken(jwt);
		localStorage.setItem('token', jwt);
	};

	const handleLogout = () => {
		setToken(null);
		localStorage.removeItem('token');
	};

	const handleSave = (savedEvent: Event) => {
		if (selectedEvent) {
			setEvents(events.map((event) => (event.id === savedEvent.id ? savedEvent : event)));
		} else {
			setEvents([...events, savedEvent]);
		}
		setIsFormVisible(false);
		setSelectedEvent(null);
	};

	const handleDelete = (id: string) => {
		fetch(`${BACKEND_URL}/api/events/${id}`, {
			method: 'DELETE',
			headers: token ? { 'Authorization': `Bearer ${token}` } : {},
		}).then(() => {
			setEvents(events.filter((event) => event.id !== id));
		});
	};

	if (!token) {
		return <Login onLogin={handleLogin} />;
	}

	return (
		<div>
			<h1>Admin Panel</h1>
			<button onClick={handleLogout}>Cerrar sesión</button>
			<button onClick={() => {
				setSelectedEvent(null);
				setIsFormVisible(true);
			}}>Add Event</button>

			{isFormVisible && (
				<EventForm
					event={selectedEvent}
					onSave={handleSave}
					onCancel={() => {
						setIsFormVisible(false);
						setSelectedEvent(null);
					}}
					token={token}
				/>
			)}

			<h2>Events</h2>
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Title</th>
						<th>Description</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.id}>
							<td>{event.id}</td>
							<td>{event.title}</td>
							<td>{event.description}</td>
							<td>
								<button onClick={() => {
									setSelectedEvent(event);
									setIsFormVisible(true);
								}}>Edit</button>
								<button onClick={() => handleDelete(event.id)}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default AdminApp;
