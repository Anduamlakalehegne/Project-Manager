import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Pending';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Completed';
}

export const auth = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth', { action: 'login', email, password });
    localStorage.setItem('token', data.token);
    return data;
  },

  async signup(name: string, email: string, password: string) {
    const { data } = await api.post('/auth', { action: 'signup', name, email, password });
    localStorage.setItem('token', data.token);
    return data;
  },

  async getUser(token: string) {
    const { data } = await api.post('/auth', { action: 'verify', token });
    return data;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

export const projects = {
  async getAll(userId: string) {
    const { data } = await api.get(`/projects?userId=${userId}`);
    return data;
  },

  async get(id: string, userId: string) {
    const { data } = await api.get(`/projects/${id}?userId=${userId}`);
    return data;
  },

  async create(project: Omit<Project, 'id'>, userId: string) {
    const { data } = await api.post('/projects', { ...project, userId });
    return data;
  },

  async update(id: string, project: Partial<Project>, userId: string) {
    const { data } = await api.put(`/projects/${id}`, { ...project, userId });
    return data;
  },

  async delete(id: string, userId: string) {
    await api.delete(`/projects/${id}?userId=${userId}`);
  }
};

export const tasks = {
  async getAll(projectId: string, userId: string) {
    const { data } = await api.get(`/projects/${projectId}/tasks?userId=${userId}`);
    return data;
  },

  async get(projectId: string, taskId: string, userId: string) {
    const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}?userId=${userId}`);
    return data;
  },

  async create(projectId: string, task: Omit<Task, 'id' | 'projectId'>, userId: string) {
    const { data } = await api.post(`/projects/${projectId}/tasks`, { ...task, userId });
    return data;
  },

  async update(projectId: string, taskId: string, task: Partial<Task>, userId: string) {
    const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, { ...task, userId });
    return data;
  },

  async delete(projectId: string, taskId: string, userId: string) {
    await api.delete(`/projects/${projectId}/tasks/${taskId}?userId=${userId}`);
  }
};
