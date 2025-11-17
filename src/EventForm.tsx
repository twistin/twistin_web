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
		<form onSubmit={handleSubmit}>
			<h2>{event ? 'Edit Event' : 'Add Event'}</h2>
			<label>
				Title:
				<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
			</label>
			<label>
				Description:
				<textarea value={description} onChange={(e) => setDescription(e.target.value)} />
			</label>
			<label>
				Cover Image:
				<input type="file" name="coverImage" onChange={handleFileChange} />
			</label>
			<label>
				Images:
				<input type="file" name="images" multiple onChange={handleFileChange} />
			</label>
			<label>
				Videos:
				<input type="file" name="videos" multiple accept="video/*" onChange={handleFileChange} />
			</label>
			<label>
				PDFs:
				<input type="file" name="pdfs" multiple accept="application/pdf" onChange={handleFileChange} />
			</label>
			<label>
				Otros archivos:
				<input type="file" name="files" multiple onChange={handleFileChange} />
			</label>
			<button type="submit">Save</button>
			<button type="button" onClick={onCancel}>Cancel</button>
		</form>
	);
}

export default EventForm;
