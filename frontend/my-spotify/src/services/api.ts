import axios from "axios";
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

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${JSON.parse(accessToken)}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
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