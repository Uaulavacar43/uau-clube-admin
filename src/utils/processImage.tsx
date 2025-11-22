import axios from "axios";
import imageCompression from "browser-image-compression";
import { api } from "../services/api";

export async function processImage(file: File | string, type: 'user' | 'wash-service' | 'wash-location') {
	if (typeof file === 'string') return file;

	const { data } = await api.post<{ url: string, urlView: string }>('/file-upload', {
		name: file.name,
		mimeType: file.type,
		type,
	});

	const compressedFile = await imageCompression(file, {
		maxSizeMB: 0.5,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
		alwaysKeepResolution: true,
		onProgress(progress) {
			console.log('Progresso de compressão:', progress);
		},
	})

	await axios.put(data.url, compressedFile)

	return data.urlView
}