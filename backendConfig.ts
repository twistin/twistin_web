const DEFAULT_PROD_ORIGIN = 'https://twistin-web.onrender.com';
const DEFAULT_DEV_ASSET_ORIGIN = 'http://localhost:3001';

const normalizeOrigin = (value?: string) => {
	if (!value) return undefined;
	return value.replace(/\/+$/, '');
};

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const envBackendOrigin = normalizeOrigin(import.meta.env.VITE_BACKEND_URL);
const envAssetsOrigin = normalizeOrigin(import.meta.env.VITE_ASSET_URL);

const isDev = import.meta.env.DEV;

const backendOrigin = envBackendOrigin ?? (isDev ? '' : DEFAULT_PROD_ORIGIN);
const assetOrigin = envAssetsOrigin ?? envBackendOrigin ?? (isDev ? DEFAULT_DEV_ASSET_ORIGIN : DEFAULT_PROD_ORIGIN);

const API_BASE = backendOrigin ? `${backendOrigin}/api` : '/api';

export const buildApiUrl = (path: string) => `${API_BASE}${ensureLeadingSlash(path)}`;

export const buildAssetUrl = (path: string) => `${assetOrigin}${ensureLeadingSlash(path)}`;

export const getUploadsBaseUrl = () => assetOrigin;
