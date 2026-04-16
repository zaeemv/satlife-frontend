import axios from "axios";
import type * as Models from "./models";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Authentication
export const auth = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>("/auth/login", { username, password }),
};

// Users
export const users = {
  list: (skip = 0, limit = 100) => api.get<Models.User[]>("/users/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.User>(`/users/${id}/`),
  create: (data: Partial<Models.User>) => api.post<Models.User>("/users/", data),
  update: (id: number, data: Partial<Models.User>) => api.put<Models.User>(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
};

// Customers
export const customers = {
  list: (skip = 0, limit = 100) => api.get<Models.Customer[]>("/customers/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Customer>(`/customers/${id}/`),
  create: (data: Partial<Models.Customer>) => api.post<Models.Customer>("/customers/", data),
  update: (id: number, data: Partial<Models.Customer>) => api.put<Models.Customer>(`/customers/${id}/`, data),
  delete: (id: number) => api.delete(`/customers/${id}/`),
};

// Orders
export const orders = {
  list: (skip = 0, limit = 100) => api.get<Models.Order[]>("/orders/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Order>(`/orders/${id}/`),
  create: (data: Partial<Models.Order>) => api.post<Models.Order>("/orders/", data),
  update: (id: number, data: Partial<Models.Order>) => api.put<Models.Order>(`/orders/${id}/`, data),
  delete: (id: number) => api.delete(`/orders/${id}/`),
};

// Projects
export const projects = {
  list: (skip = 0, limit = 100) => api.get<Models.Project[]>("/projects/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Project>(`/projects/${id}/`),
  create: (data: Partial<Models.Project>) => api.post<Models.Project>("/projects/", data),
  update: (id: number, data: Partial<Models.Project>) => api.put<Models.Project>(`/projects/${id}/`, data),
  delete: (id: number) => api.delete(`/projects/${id}/`),
  getSystems: (id: number) => api.get<Models.System[]>(`/projects/${id}/systems/`),
};

// Systems
export const systems = {
  list: (skip = 0, limit = 100) => api.get<Models.System[]>("/systems/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.System>(`/systems/${id}/`),
  create: (data: Partial<Models.System>) => api.post<Models.System>("/systems/", data),
  update: (id: number, data: Partial<Models.System>) => api.put<Models.System>(`/systems/${id}/`, data),
  delete: (id: number) => api.delete(`/systems/${id}/`),
  getSubsystems: (id: number) => api.get<Models.Subsystem[]>(`/systems/${id}/subsystems/`),
};

// Subsystems
export const subsystems = {
  list: (skip = 0, limit = 100) => api.get<Models.Subsystem[]>("/subsystems/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Subsystem>(`/subsystems/${id}/`),
  create: (data: Partial<Models.Subsystem>) => api.post<Models.Subsystem>("/subsystems/", data),
  update: (id: number, data: Partial<Models.Subsystem>) => api.put<Models.Subsystem>(`/subsystems/${id}/`, data),
  delete: (id: number) => api.delete(`/subsystems/${id}/`),
  getModules: (id: number) => api.get<Models.Module[]>(`/subsystems/${id}/modules/`),
};

// Modules
export const modules = {
  list: (skip = 0, limit = 100) => api.get<Models.Module[]>("/modules/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Module>(`/modules/${id}/`),
  create: (data: Partial<Models.Module>) => api.post<Models.Module>("/modules/", data),
  update: (id: number, data: Partial<Models.Module>) => api.put<Models.Module>(`/modules/${id}/`, data),
  delete: (id: number) => api.delete(`/modules/${id}/`),
  getUnits: (id: number) => api.get<Models.Unit[]>(`/modules/${id}/units/`),
};

// Units
export const units = {
  list: (skip = 0, limit = 100) => api.get<Models.Unit[]>("/units/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Unit>(`/units/${id}/`),
  create: (data: Partial<Models.Unit>) => api.post<Models.Unit>("/units/", data),
  update: (id: number, data: Partial<Models.Unit>) => api.put<Models.Unit>(`/units/${id}/`, data),
  delete: (id: number) => api.delete(`/units/${id}/`),
  getComponents: (id: number) => api.get<Models.Component[]>(`/units/${id}/components/`),
};

// Components
export const components = {
  list: (skip = 0, limit = 100) => api.get<Models.Component[]>("/components/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Component>(`/components/${id}/`),
  create: (data: Partial<Models.Component>) => api.post<Models.Component>("/components/", data),
  update: (id: number, data: Partial<Models.Component>) => api.put<Models.Component>(`/components/${id}/`, data),
  delete: (id: number) => api.delete(`/components/${id}/`),
};

// Inventory
export const inventory = {
  list: (skip = 0, limit = 100) => api.get<Models.Inventory[]>("/inventory/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Inventory>(`/inventory/${id}/`),
  create: (data: Partial<Models.Inventory>) => api.post<Models.Inventory>("/inventory/", data),
  update: (id: number, data: Partial<Models.Inventory>) => api.put<Models.Inventory>(`/inventory/${id}/`, data),
  delete: (id: number) => api.delete(`/inventory/${id}/`),
};

// Statuses
export const statuses = {
  list: (status_type?: string) =>
    api.get<Models.Status[]>("/statuses/", {
      params: { status_type },
    }),
  get: (id: number) => api.get<Models.Status>(`/statuses/${id}/`),
  create: (data: Partial<Models.Status>) => api.post<Models.Status>("/statuses/", data),
  update: (id: number, data: Partial<Models.Status>) => api.put<Models.Status>(`/statuses/${id}/`, data),
  delete: (id: number) => api.delete(`/statuses/${id}/`),
};

// Entities
export const entities = {
  list: (skip = 0, limit = 100) => api.get<Models.Entity[]>("/entities/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.Entity>(`/entities/${id}/`),
  getStatusHistory: (id: number) => api.get<Models.EntityStatusHistory[]>(`/entities/${id}/status-history/`),
  getMaintenanceLogs: (id: number) => api.get<Models.MaintenanceLog[]>(`/entities/${id}/maintenanceLogs-logs/`),
};

// Entity Status History
export const entityStatusHistory = {
  list: (skip = 0, limit = 100) =>
    api.get<Models.EntityStatusHistory[]>("/entity-status-history/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.EntityStatusHistory>(`/entity-status-history/${id}/`),
  create: (data: Partial<Models.EntityStatusHistory>) => api.post<Models.EntityStatusHistory>("/entity-status-history/", data),
};

// maintenanceLogs Logs
export const maintenanceLogs = {
  list: (skip = 0, limit = 100) => api.get<Models.MaintenanceLog[]>("/maintenanceLogs-logs/", { params: { skip, limit } }),
  get: (id: number) => api.get<Models.MaintenanceLog>(`/maintenanceLogs-logs/${id}/`),
  create: (data: Partial<Models.MaintenanceLog>) => api.post<Models.MaintenanceLog>("/maintenanceLogs-logs/", data),
  update: (id: number, data: Partial<Models.MaintenanceLog>) => api.put<Models.MaintenanceLog>(`/maintenanceLogs-logs/${id}/`, data),
  delete: (id: number) => api.delete(`/maintenanceLogs-logs/${id}/`),
};

export default api;
