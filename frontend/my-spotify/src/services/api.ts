import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import { ApiValidationErrors } from "@/types";

export class ApiError extends Error {
    status: number;
    errors: ApiValidationErrors;

    constructor(
        status: number,
        errors: ApiValidationErrors,
        message = "API request failed"
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }

    getFirstError(): string {
        for (const value of Object.values(this.errors)) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    return value[0];
                }
            } else if (typeof value === "string") {
                return value;
            }
        }

        return this.message;
    }
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});


// attach access token
api.interceptors.request.use(
    (config) => {
        const accessTokenRaw = localStorage.getItem("accessToken");

        if (accessTokenRaw) {
            let tokenValue = accessTokenRaw as string;
            try {
                tokenValue = JSON.parse(accessTokenRaw as string);
            } catch {
                // token stored as raw string, keep tokenValue
            }

            // Ensure headers exist and attach Authorization
            (config.headers as any) = config.headers || {};
            (config.headers as any).Authorization = `Bearer ${tokenValue}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// refresh access token
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/refresh/`,
        {
            refresh: JSON.parse(refreshToken as string),
        }
    );

    const newAccessToken = response.data.access;

    localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
    return newAccessToken;
};

// refreshes the access token
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as
            | InternalAxiosRequestConfig & {
                  _retry?: boolean;
              };

        /*
         * Only attempt refresh for 401 responses.
         *
         * _retry prevents an infinite loop if the refreshed
         * token is also rejected.
         */
        if (error.response?.status !== 401 || originalRequest?._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        try {
            /*
             * If another request is already refreshing the token,
             * wait for that same refresh request.
             */
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken()
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            // Attach new access token to the original request and retry
            (originalRequest.headers as any) = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            /*
             * Refresh token is invalid/expired.
             * The session can no longer be restored.
             */
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            return Promise.reject(refreshError);
        }
    }
);

export default api;

export function handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            throw new ApiError(
                error.response.status,
                error.response.data
            );
        }

        throw new ApiError(
            0,
            {},
            "Unable to connect to the server."
        );
    }

    throw error;
}


const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export function getMediaUrl(path: string | null | undefined) {
    if (!path) return undefined;

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
