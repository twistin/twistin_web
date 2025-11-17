import { useCallback, useEffect, useState } from 'react';
import EventForm from './EventForm';
import Login from './Login';
import { buildApiUrl, buildAssetUrl } from '../backendConfig';

type MediaItem = {
	src: string;
	alt: string;
};

interface AdminEvent {
	id: string;
	title: string;
	description: string;
	coverImage: MediaItem;
	images: MediaItem[];
	videos?: MediaItem[];
	pdfs?: MediaItem[];
	files?: MediaItem[];
}

type RawAdminEvent = Omit<AdminEvent, 'images' | 'videos' | 'pdfs' | 'files'> & {
	images?: MediaItem[];
	videos?: MediaItem[];
	pdfs?: MediaItem[];
	files?: MediaItem[];
};

const getStoredToken = () => {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('adminToken');
};

const truncateText = (text: string, max = 220) => {
	if (!text) return '';
	return text.length > max ? `${text.slice(0, max)}…` : text;
};

const formatMediaSummary = (event: AdminEvent) => {
	const summary = [
		event.images.length ? `${event.images.length} imágenes` : null,
		event.videos && event.videos.length ? `${event.videos.length} videos` : null,
		event.pdfs && event.pdfs.length ? `${event.pdfs.length} PDFs` : null,
		event.files && event.files.length ? `${event.files.length} archivos` : null,
	].filter((value): value is string => Boolean(value));

	return summary.join(' · ');
};

const normalizeEvent = (event: RawAdminEvent): AdminEvent => ({
	...event,
	images: event.images ?? [],
	videos: event.videos ?? [],
	pdfs: event.pdfs ?? [],
	files: event.files ?? []
});

const getMediaUrl = (src?: string) => {
	if (!src) return '';
	return src.startsWith('http') ? src : buildAssetUrl(src);
};

export default function AdminApp() {
	const [token, setToken] = useState<string | null>(() => getStoredToken());
	const [events, setEvents] = useState<AdminEvent[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);

	const handleLogout = useCallback(() => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('adminToken');
		}
		setToken(null);
		setEvents([]);
		setEditingEvent(null);
		setIsFormOpen(false);
	}, []);

	const fetchEvents = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(buildApiUrl('/events'));
			if (!res.ok) {
				throw new Error('No se pudieron cargar los eventos.');
			}
			const data: RawAdminEvent[] = await res.json();
			const normalized = data.map(normalizeEvent).reverse();
			setEvents(normalized);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Error inesperado al cargar los eventos.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	const verifyToken = useCallback(async (currentToken: string) => {
		const res = await fetch(buildApiUrl('/admin'), {
			headers: {
				Authorization: `Bearer ${currentToken}`
			}
		});

		if (!res.ok) {
			throw new Error('Sesión expirada, vuelve a iniciar sesión.');
		}
	}, []);

	useEffect(() => {
		if (!token) return;

		let isActive = true;
		const validateAndLoad = async () => {
			try {
				await verifyToken(token);
				if (!isActive) return;
				await fetchEvents();
			} catch (err) {
				if (!isActive) return;
				const message = err instanceof Error ? err.message : 'No pudimos validar tu sesión.';
				setError(message);
				handleLogout();
			}
		};

		validateAndLoad();
		return () => {
			isActive = false;
		};
	}, [token, verifyToken, fetchEvents, handleLogout]);

	const handleLogin = (newToken: string) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('adminToken', newToken);
		}
		setToken(newToken);
		setError(null);
	};

	const openNewEventForm = () => {
		setEditingEvent(null);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingEvent(null);
	};

	const handleFormSave = (savedEvent: AdminEvent) => {
		setEvents((prev) => {
			const index = prev.findIndex((evt) => evt.id === savedEvent.id);
			if (index >= 0) {
				const updated = [...prev];
				updated[index] = savedEvent;
				return updated;
			}
			return [savedEvent, ...prev];
		});

		closeForm();
	};

	const handleDelete = async (eventId: string) => {
		if (!token) return;

		const confirmed =
			typeof window === 'undefined' ? true : window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.');
		if (!confirmed) return;

		try {
			const res = await fetch(buildApiUrl(`/events/${eventId}`), {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!res.ok) {
				throw new Error('No se pudo eliminar el evento.');
			}

			setEvents((prev) => prev.filter((event) => event.id !== eventId));
			if (editingEvent?.id === eventId) {
				closeForm();
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Error al eliminar el evento.';
			setError(message);
		}
	};

	if (!token) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
				<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-4">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900 text-center">Panel de administración</h1>
						<p className="text-sm text-gray-500 text-center">Inicia sesión para gestionar el portfolio.</p>
					</div>
					{error && <p className="text-sm text-red-600 text-center">{error}</p>}
					<Login onLogin={handleLogin} />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-950 text-gray-100">
			<div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
				<header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-gray-400">twistin</p>
						<h1 className="text-3xl font-semibold text-white">Panel de administración</h1>
						<p className="text-sm text-gray-400">Gestiona los eventos del portfolio en tiempo real.</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => {
								setError(null);
								fetchEvents();
							}}
							disabled={loading}
							className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/60 disabled:opacity-50"
						>
							{loading ? 'Actualizando…' : 'Actualizar'}
						</button>
						<button
							type="button"
							onClick={openNewEventForm}
							className="rounded-full bg-brand-highlight px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-200"
						>
							Nuevo evento
						</button>
						<button
							type="button"
							onClick={() => {
								setError(null);
								handleLogout();
							}}
							className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200 hover:border-red-400 hover:text-white"
						>
							Cerrar sesión
						</button>
					</div>
				</header>

				{error && (
					<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
						{error}
					</div>
				)}

				<section className="rounded-3xl border border-white/5 bg-white/[0.04] p-6 backdrop-blur">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-white">Eventos publicados</h2>
						<p className="text-xs uppercase tracking-widest text-gray-500">{events.length} activos</p>
					</div>

					{loading && (
						<p className="mt-6 text-sm text-gray-400 animate-pulse">Cargando eventos desde el servidor…</p>
					)}

					{!loading && events.length === 0 && (
						<p className="mt-6 text-sm text-gray-400">No hay eventos guardados todavía.</p>
					)}

					<ul className="mt-6 space-y-4">
						{events.map((event) => (
							<li key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
								<div className="flex flex-col gap-4 md:flex-row">
									<div className="w-full md:w-48 shrink-0">
										{event.coverImage?.src ? (
											<img
												src={getMediaUrl(event.coverImage.src)}
												alt={event.coverImage.alt || event.title}
												className="h-40 w-full rounded-xl object-cover"
											/>
										) : (
											<div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-white/20 text-xs uppercase tracking-[0.3em] text-gray-500">
												Sin imagen
											</div>
										)}
									</div>
									<div className="flex-1 space-y-3">
										<div className="flex flex-wrap items-start justify-between gap-4">
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{event.id}</p>
												<h3 className="text-2xl font-semibold text-white">{event.title}</h3>
											</div>
											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => {
														setEditingEvent(event);
														setIsFormOpen(true);
													}}
													className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-widest text-white hover:border-white/60"
												>
													Editar
												</button>
												<button
													type="button"
													onClick={() => handleDelete(event.id)}
													className="rounded-full border border-red-400/30 px-3 py-1 text-xs uppercase tracking-widest text-red-200 hover:border-red-400 hover:text-white"
												>
													Eliminar
												</button>
											</div>
										</div>
										<p className="text-sm leading-relaxed text-gray-200">
											{truncateText(event.description)}
										</p>
										{formatMediaSummary(event) && (
											<p className="text-xs uppercase tracking-[0.4em] text-gray-500">{formatMediaSummary(event)}</p>
										)}
										{event.images.length > 0 && (
											<div className="flex flex-wrap gap-2 pt-2">
												{event.images.slice(0, 4).map((image, index) => (
													<img
														key={`${event.id}-img-${index}`}
														src={getMediaUrl(image.src)}
														alt={image.alt || `${event.title} imagen ${index + 1}`}
														className="h-16 w-16 rounded-lg object-cover"
													/>
												))}
												{event.images.length > 4 && (
													<div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 text-xs text-gray-400">
														+{event.images.length - 4}
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>

				{isFormOpen && (
					<section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-gray-500">Editor</p>
								<h2 className="text-xl font-semibold text-white">
									{editingEvent ? 'Editar evento' : 'Nuevo evento'}
								</h2>
							</div>
							<button
								type="button"
								onClick={closeForm}
								className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-white hover:border-white/60"
							>
								Cerrar
							</button>
						</div>
						<div className="bg-white rounded-2xl p-4 text-gray-900">
							<EventForm event={editingEvent} onSave={handleFormSave} onCancel={closeForm} token={token} />
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
