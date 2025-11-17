import { useState, useEffect } from 'react';
import EventForm from './EventForm';
// Tipos
interface Event {
  id: string;
  title: string;
  description: string;
  coverImage: { src: string; alt: string };
  images: { src: string; alt: string }[];
}

// Componente Login
function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
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
        setError(data.error || 'Login fallido');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Panel Admin</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}

// Componente Formulario
function EventForm({ event, onSave, onCancel, token }: any) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      let coverPath = event?.coverImage?.src || '';
      
      if (coverImage) {
        const fd = new FormData();
        fd.append('file', coverImage);
        const res = await fetch('https://twistin-web.onrender.com/api/upload', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        coverPath = data.filePath;
      }

      const imgPaths = event?.images?.map((img: any) => img.src) || [];
      if (images) {
        for (let i = 0; i < images.length; i++) {
          const fd = new FormData();
          fd.append('file', images[i]);
          const res = await fetch('https://twistin-web.onrender.com/api/upload', {
            method: 'POST',
            body: fd,
          });
          const data = await res.json();
          imgPaths.push(data.filePath);
        }
      }

      const url = event 
        ? `https://twistin-web.onrender.com/api/events/${event.id}` 
        : 'https://twistin-web.onrender.com/api/events';
      
      const response = await fetch(url, {
        method: event ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          coverImage: { src: coverPath, alt: title },
          images: imgPaths.map((path: string) => ({ src: path, alt: title })),
        }),
      });

      const saved = await response.json();
      onSave(saved);
    } catch (err) {
      alert('Error al guardar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{event ? 'Editar' : 'Nuevo'} Evento</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Portada</label>
            <input
              type="file"
              onChange={e => setCoverImage(e.target.files?.[0] || null)}
              className="w-full"
              accept="image/*"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Imágenes</label>
            <input
              type="file"
              multiple
              onChange={e => setImages(e.target.files)}
              className="w-full"
              accept="image/*"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// App Principal
export default function AdminApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND = 'https://twistin-web.onrender.com';

  useEffect(() => {
    if (token) loadEvents();
  }, [token]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${BACKEND}/api/events`);
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (jwt: string) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const handleSave = (saved: Event) => {
    if (selectedEvent) {
      setEvents(events.map(e => e.id === saved.id ? saved : e));
    } else {
      setEvents([...events, saved]);
    }
    setIsFormVisible(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar evento?')) return;
    
    try {
      await fetch(`${BACKEND}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setEvents(events.filter(e => e.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedEvent(null); setIsFormVisible(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Nuevo
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">Sin eventos</p>
            <button
              onClick={() => { setSelectedEvent(null); setIsFormVisible(true); }}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear primero
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imágenes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{event.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.images?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => { setSelectedEvent(event); setIsFormVisible(true); }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isFormVisible && (
        <EventForm
          event={selectedEvent}
          onSave={handleSave}
          onCancel={() => { setIsFormVisible(false); setSelectedEvent(null); }}
          token={token}
        />
      )}
    </div>
  );
}
