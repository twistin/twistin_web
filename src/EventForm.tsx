import { useState, useEffect } from 'react';
import { buildApiUrl } from '../backendConfig';

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
	videos?: { src: string; alt: string }[];
	pdfs?: { src: string; alt: string }[];
	files?: { src: string; alt: string }[];
}

interface EventFormProps {
	event: Event | null;
	onSave: (event: Event) => void;
	onCancel: () => void;
	token: string;
}

function EventForm({ event, onSave, onCancel, token }: EventFormProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [images, setImages] = useState<FileList | null>(null);
	const [videos, setVideos] = useState<FileList | null>(null);
	const [pdfs, setPdfs] = useState<FileList | null>(null);
	const [files, setFiles] = useState<FileList | null>(null);

	useEffect(() => {
		if (event) {
			setTitle(event.title);
			setDescription(event.description);
		} else {
			setTitle('');
			setDescription('');
		}
		setVideos(null);
		setPdfs(null);
		setFiles(null);
	}, [event]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.name === 'coverImage') {
			if (e.target.files) {
				setCoverImage(e.target.files[0]);
			}
		} else if (e.target.name === 'images') {
			setImages(e.target.files);
		} else if (e.target.name === 'videos') {
			setVideos(e.target.files);
		} else if (e.target.name === 'pdfs') {
			setPdfs(e.target.files);
		} else if (e.target.name === 'files') {
			setFiles(e.target.files);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		let coverImagePath = event?.coverImage?.src || '';
		if (coverImage) {
			const formData = new FormData();
			formData.append('file', coverImage);
			const res = await fetch(buildApiUrl('/upload'), {
				method: 'POST',
				body: formData,
			});
			const data = await res.json();
			coverImagePath = data.filePath;
		}

		const imagesPaths = event?.images?.map(img => img.src) || [];
		if (images) {
			for (let i = 0; i < images.length; i++) {
				const formData = new FormData();
				formData.append('file', images[i]);
				const res = await fetch(buildApiUrl('/upload'), {
					method: 'POST',
					body: formData,
				});
				const data = await res.json();
				imagesPaths.push(data.filePath);
			}
		}

		// Subir videos
		const videosPaths: string[] = event?.videos?.map(v => v.src) || [];
		if (videos) {
			for (let i = 0; i < videos.length; i++) {
				const formData = new FormData();
				formData.append('file', videos[i]);
				const res = await fetch(buildApiUrl('/upload'), {
					method: 'POST',
					body: formData,
				});
				const data = await res.json();
				videosPaths.push(data.filePath);
			}
		}
		// Subir PDFs
		const pdfsPaths: string[] = event?.pdfs?.map(p => p.src) || [];
		if (pdfs) {
			for (let i = 0; i < pdfs.length; i++) {
				const formData = new FormData();
				formData.append('file', pdfs[i]);
				const res = await fetch(buildApiUrl('/upload'), {
					method: 'POST',
					body: formData,
				});
				const data = await res.json();
				pdfsPaths.push(data.filePath);
			}
		}
		// Subir otros archivos
		const filesPaths: string[] = event?.files?.map(f => f.src) || [];
		if (files) {
			for (let i = 0; i < files.length; i++) {
				const formData = new FormData();
				formData.append('file', files[i]);
				const res = await fetch(buildApiUrl('/upload'), {
					method: 'POST',
					body: formData,
				});
				const data = await res.json();
				filesPaths.push(data.filePath);
			}
		}

		const url = buildApiUrl(event ? `/events/${event.id}` : '/events');
		const method = event ? 'PUT' : 'POST';

		const body = {
			title,
			description,
			coverImage: {
				src: coverImagePath,
				alt: title,
			},
			images: imagesPaths.map(path => ({ src: path, alt: title })),
			videos: videosPaths.map(path => ({ src: path, alt: title })),
			pdfs: pdfsPaths.map(path => ({ src: path, alt: title })),
			files: filesPaths.map(path => ({ src: path, alt: title })),
		};

		fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then((savedEvent) => {
				onSave(savedEvent);
			});
	};

	return (
		<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
			<form onSubmit={handleSubmit} style={{
				background:'#fff',
				borderRadius:'16px',
				boxShadow:'0 2px 16px rgba(0,0,0,0.08)',
				padding:'2.5rem 2rem',
				minWidth:'320px',
				maxWidth:'420px',
				width:'100%',
				display:'flex',
				flexDirection:'column',
				gap:'1.2rem',
				fontFamily:'inherit'
			}}>
				<h2 style={{textAlign:'center',marginBottom:'0.2rem',fontSize:'1.3rem',fontWeight:700}}>{event ? 'Editar evento' : 'Añadir evento'}</h2>
				<div style={{display:'flex',flexDirection:'column',gap:'0.7rem'}}>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Título
						<input type="text" value={title} onChange={e => setTitle(e.target.value)}
							style={{width:'100%',marginTop:'0.3rem',padding:'0.5rem',borderRadius:'6px',border:'1px solid #ddd',fontSize:'1rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Descripción
						<textarea value={description} onChange={e => setDescription(e.target.value)}
							style={{width:'100%',marginTop:'0.3rem',padding:'0.5rem',borderRadius:'6px',border:'1px solid #ddd',fontSize:'1rem',minHeight:'80px'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Imagen principal
						<input type="file" name="coverImage" onChange={handleFileChange}
							style={{marginTop:'0.3rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Imágenes
						<input type="file" name="images" multiple onChange={handleFileChange}
							style={{marginTop:'0.3rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Videos
						<input type="file" name="videos" multiple accept="video/*" onChange={handleFileChange}
							style={{marginTop:'0.3rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>PDFs
						<input type="file" name="pdfs" multiple accept="application/pdf" onChange={handleFileChange}
							style={{marginTop:'0.3rem'}} />
					</label>
					<label style={{fontWeight:500,fontSize:'1rem'}}>Otros archivos
						<input type="file" name="files" multiple onChange={handleFileChange}
							style={{marginTop:'0.3rem'}} />
					</label>
				</div>
				<div style={{display:'flex',gap:'1rem',marginTop:'1.2rem'}}>
					<button type="submit" style={{
						background:'#222',color:'#fff',border:'none',borderRadius:'6px',padding:'0.7rem 1.2rem',fontWeight:600,fontSize:'1rem',cursor:'pointer',flex:1
					}}>Guardar</button>
					<button type="button" onClick={onCancel} style={{
						background:'#eee',color:'#222',border:'none',borderRadius:'6px',padding:'0.7rem 1.2rem',fontWeight:600,fontSize:'1rem',cursor:'pointer',flex:1
					}}>Cancelar</button>
				</div>
			</form>
		</div>
	);
}

export default EventForm;
