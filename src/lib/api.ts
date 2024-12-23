import axios from 'axios';
import dbConnect from './db';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Project';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

const JWT_SECRET = process.env.JWT_SECRET as string;

export const auth = {
  login: async (email: string, password: string) => {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { id: user._id, name: user.name, email: user.email } };
  },
  signup: async (name: string, email: string, password: string) => {
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { id: user._id, name: user.name, email: user.email } };
  },
  getUser: async (token: string) => {
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string };
      await dbConnect();
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      return { id: user._id, name: user.name, email: user.email };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
};

export const projects = {
  getAll: async (userId: string) => {
    await dbConnect();
    const projects = await Project.find({ userId });
    return projects.map(p => ({ id: p._id, name: p.name, description: p.description, status: p.status }));
  },
  get: async (id: string, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    return { id: project._id, name: project.name, description: project.description, status: project.status };
  },
  create: async (project: Omit<Project, 'id'>, userId: string) => {
    await dbConnect();
    const newProject = await Project.create({ ...project, userId });
    return { id: newProject._id, name: newProject.name, description: newProject.description, status: newProject.status };
  },
  update: async (id: string, project: Partial<Project>, userId: string) => {
    await dbConnect();
    const updatedProject = await Project.findOneAndUpdate({ _id: id, userId }, project, { new: true });
    if (!updatedProject) {
      throw new Error('Project not found');
    }
    return { id: updatedProject._id, name: updatedProject.name, description: updatedProject.description, status: updatedProject.status };
  },
  delete: async (id: string, userId: string) => {
    await dbConnect();
    const deletedProject = await Project.findOneAndDelete({ _id: id, userId });
    if (!deletedProject) {
      throw new Error('Project not found');
    }
    await Task.deleteMany({ projectId: id });
  },
};

export const tasks = {
  getAll: async (projectId: string, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    const tasks = await Task.find({ projectId });
    return tasks.map(t => ({ 
      id: t._id, 
      projectId: t.projectId, 
      title: t.title, 
      description: t.description, 
      dueDate: t.dueDate.toISOString().split('T')[0], 
      priority: t.priority, 
      status: t.status 
    }));
  },
  get: async (projectId: string, taskId: string, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      throw new Error('Task not found');
    }
    return { 
      id: task._id, 
      projectId: task.projectId, 
      title: task.title, 
      description: task.description, 
      dueDate: task.dueDate.toISOString().split('T')[0], 
      priority: task.priority, 
      status: task.status 
    };
  },
  create: async (projectId: string, task: Omit<Task, 'id' | 'projectId'>, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    const newTask = await Task.create({ ...task, projectId });
    return { 
      id: newTask._id, 
      projectId: newTask.projectId, 
      title: newTask.title, 
      description: newTask.description, 
      dueDate: newTask.dueDate.toISOString().split('T')[0], 
      priority: newTask.priority, 
      status: newTask.status 
    };
  },
  update: async (projectId: string, taskId: string, task: Partial<Task>, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    const updatedTask = await Task.findOneAndUpdate({ _id: taskId, projectId }, task, { new: true });
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    return { 
      id: updatedTask._id, 
      projectId: updatedTask.projectId, 
      title: updatedTask.title, 
      description: updatedTask.description, 
      dueDate: updatedTask.dueDate.toISOString().split('T')[0], 
      priority: updatedTask.priority, 
      status: updatedTask.status 
    };
  },
  delete: async (projectId: string, taskId: string, userId: string) => {
    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }
    const deletedTask = await Task.findOneAndDelete({ _id: taskId, projectId });
    if (!deletedTask) {
      throw new Error('Task not found');
    }
  },
};

