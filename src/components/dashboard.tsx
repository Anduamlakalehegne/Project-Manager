'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './auth-provider'
import { ProjectCard } from './project-card'
import { CreateProjectModal } from './create-project-modal'
import { EditProjectModal } from './edit-project-modal'
import { Button } from '@/components/ui/button'
import { projects, Project } from '@/lib/api'
import { useToast } from '@/components/ui/use-tost'
import { Loader2 } from 'lucide-react'

export function Dashboard() {
  const { user, logout } = useAuth()
  const [projectList, setProjectList] = useState<Project[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const fetchedProjects = await projects.getAll(user!.id)
      setProjectList(fetchedProjects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (newProject: Omit<Project, 'id'>) => {
    try {
      const createdProject = await projects.create(newProject, user!.id)
      setProjectList([...projectList, createdProject])
      setIsCreateModalOpen(false)
      toast({
        title: "Success",
        description: "Project created successfully.",
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = async (id: string, updatedProject: Partial<Project>) => {
    try {
      const updated = await projects.update(id, updatedProject, user!.id)
      setProjectList(projectList.map(p => p.id === id ? updated : p))
      setIsEditModalOpen(false)
      toast({
        title: "Success",
        description: "Project updated successfully.",
      })
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await projects.delete(id, user!.id)
      setProjectList(projectList.filter(p => p.id !== id))
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      })
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <Button onClick={logout}>Logout</Button>
      </div>
      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)}>Create New Project</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectList.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onEdit={() => {
              setEditingProject(project)
              setIsEditModalOpen(true)
            }}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
      {editingProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingProject(null)
          }}
          onEditProject={(updatedProject) => handleEditProject(editingProject.id, updatedProject)}
          project={editingProject}
        />
      )}
    </div>
  )
}

