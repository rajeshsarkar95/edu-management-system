
import type { AdmissionStatus } from "./constants";
import type { AdmissionFormValues, FileMeta } from "./schema";
import type { Application } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_ADMISSION_API_URL ?? "http://localhost:5000/api/v1/admissions").replace(/\/+$/, "");
const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
})();

export function assetUrl(path?: string | null) {
  if (!path) return undefined;
  return /^(https?:|data:|blob:)/.test(path) ? path : `${API_ORIGIN}${path}`;
}
export function fileSrc(f?: FileMeta | null) {
  const uploadedUrl = f && "url" in f && typeof f.url === "string" ? f.url : undefined;
  return f ? assetUrl(uploadedUrl) ?? f.dataUrl : undefined;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? "token");
  } catch {
    return null;
  }
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isForm || !init.body ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, `Can't reach the admissions server at ${API_ORIGIN || API_URL}. Is the backend running?`);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = json.errors?.[0];
    const msg = first ? `${json.message ?? "Validation failed"}: ${first.field} – ${first.message}` : (json.message ?? `Request failed (${res.status})`);
    throw new ApiError(res.status, res.status === 401 ? "You are not signed in. Please log in again." : msg, json.errors);
  }
  return json as T;
}

const qs = (p: object) => {
  const u = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v !== undefined && v !== "" && v !== "all" && u.set(k, String(v)));
  const s = u.toString();
  return s ? `?${s}` : "";
};

export interface ListParams {
  q?: string;
  status?: AdmissionStatus;
  course?: string;
  session?: string;
  from?: string;
  to?: string;
  sortBy?: "id" | "fullName" | "course" | "mobile" | "applicationDate" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const admissionApi = {
  list: (p: ListParams = {}) => request<{ data: Application[]; pagination: Pagination }>(qs(p)),
  
  async listAll(maxPages = 50): Promise<Application[]> {
    const first = await this.list({ page: 1, limit: 100 });
    const all = [...first.data];
    for (let page = 2; page <= Math.min(first.pagination.pages, maxPages); page++) {
      all.push(...(await this.list({ page, limit: 100 })).data);
    }
    return all;
  },
  get: (id: string) => request<{ data: Application }>(`/${id}`).then((r) => r.data),
  create: (v: AdmissionFormValues) => request<{ data: Application }>("", { method: "POST", body: JSON.stringify(v) }).then((r) => r.data),
  update: (id: string, v: AdmissionFormValues) => request<{ data: Application }>(`/${id}`, { method: "PUT", body: JSON.stringify(v) }).then((r) => r.data),
  setStatus: (id: string, status: AdmissionStatus, remarks?: string) =>
    request<{ data: Application }>(`/${id}/status`, { method: "PUT", body: JSON.stringify({ status, remarks }) }).then((r) => r.data),
  remove: (id: string) => request<unknown>(`/${id}`, { method: "DELETE" }),
  restore: (id: string) => request<{ data: Application }>(`/${id}/restore`, { method: "POST" }).then((r) => r.data),
  uploadDocument(id: string, key: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ data: Application }>(`/${id}/documents/${key}`, { method: "POST", body: fd }).then((r) => r.data);
  },
};