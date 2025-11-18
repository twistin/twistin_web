const DEFAULT_PROD_ORIGIN = 'https://twistin-web.onrender.com';
const DEFAULT_DEV_ASSET_PORT = 3001;
const DEFAULT_DEV_ASSET_ORIGIN = `http://localhost:${DEFAULT_DEV_ASSET_PORT}`;

const computeDevAssetOrigin = () => {
	if (typeof window === 'undefined') {
		return DEFAULT_DEV_ASSET_ORIGIN;
	}
	const { protocol, hostname } = window.location;
	return `${protocol}//${hostname}:${DEFAULT_DEV_ASSET_PORT}`;
};

const normalizeOrigin = (value?: string) => {
	if (!value) return undefined;
	return value.replace(/\/+$/, '');
};

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);
const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);
const isProtocolRelative = (value: string) => /^\/\//.test(value);
const trimPath = (value?: string) => (value ?? '').trim();

const envBackendOrigin = normalizeOrigin(import.meta.env.VITE_BACKEND_URL);
const envAssetsOrigin = normalizeOrigin(import.meta.env.VITE_ASSET_URL);

const isDev = import.meta.env.DEV;
const useDevProxy = isDev && import.meta.env.VITE_USE_DEV_PROXY === 'true';

const backendOrigin = envBackendOrigin ?? (useDevProxy ? '' : DEFAULT_PROD_ORIGIN);
const assetOrigin =
	envAssetsOrigin ??
	envBackendOrigin ??
	(useDevProxy ? computeDevAssetOrigin() : DEFAULT_PROD_ORIGIN);

const API_BASE = backendOrigin ? `${backendOrigin}/api` : '/api';

export const buildApiUrl = (path: string) => `${API_BASE}${ensureLeadingSlash(path)}`;

const FORCE_HTTPS_HOSTS = new Set(['twistin-web.onrender.com']);

const normalizeAbsoluteUrl = (value: string) => {
	const normalized = trimPath(value);
	if (!normalized) return '';
	try {
		if (isProtocolRelative(normalized)) {
			const protocol =
				(typeof window !== 'undefined' && window.location?.protocol) || 'https:';
			return `${protocol}${normalized}`;
		}
		const parsed = new URL(normalized);
		if (parsed.protocol === 'http:' && FORCE_HTTPS_HOSTS.has(parsed.hostname)) {
			parsed.protocol = 'https:';
		}
		return parsed.toString();
	} catch {
		return normalized;
	}
};

export const buildAssetUrl = (path: string) => {
	const normalized = trimPath(path);
	if (!normalized) return '';
	if (isAbsoluteUrl(normalized) || isProtocolRelative(normalized)) {
		return normalizeAbsoluteUrl(normalized);
	}
	return `${assetOrigin}${ensureLeadingSlash(normalized)}`;
};

export const getUploadsBaseUrl = () => assetOrigin;
