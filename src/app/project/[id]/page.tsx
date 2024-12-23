'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { TaskList } from '@/components/task-list'
import { CreateTaskModal } from '@/components/create-task-modal'
import { EditTaskModal } from '@/components/edit-task-modal'
import { Button } from '@/components/ui/button'
import { projects, tasks, Project, Task } from '@/lib/api'
import { useToast } from '@/components/ui/use-tost'
import { Loader2 } from 'lucide-react'

export default function ProjectPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [taskList, setTaskList] = useState<Task[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user && id) {
      fetchProjectAndTasks()
    }
  }, [user, id])

  const fetchProjectAndTasks = async () => {
    try {
      setIsLoading(true)
      const [projectResponse, tasksResponse] = await Promise.all([
        projects.get(id as string, user!.id),
        tasks.getAll(id as string, user!.id)
      ])
      setProject(projectResponse)
      setTaskList(tasksResponse)
    } catch (error) {
      console.error('Failed to fetch project and tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch project and tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'projectId'>) => {
    try {
      const createdTask = await tasks.create(id as string, newTask, user!.id)
      setTaskList([...taskList, createdTask])
      setIsCreateModalOpen(false)
      toast({
        title: "Success",
        description: "Task created successfully.",
      })
    } catch (error) {
      console.error('Failed to create task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      const updated = await tasks.update(id as string, taskId, updatedTask, user!.id)
      setTaskList(taskList.map(t => t.id === taskId ? updated : t))
      setIsEditModalOpen(false)
      toast({
        title: "Success",
        description: "Task updated successfully.",
      })
    } catch (error) {
      console.error('Failed to update task:', error)
    //   toast({
    //     title: "Error",
    //     description: "Failed to update task. Please try again.",
    //     variant: "destructive",
    //   })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasks.delete(id as string, taskId, user!.id)
      setTaskList(taskList.filter(t => t.id !== taskId))
    //   toast({
    //     title: "Success",
    //     description: "Task deleted successfully.",
    //   })
    } catch (error) {
      console.error('Failed to delete task:', error)
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete task. Please try again.",
    //     variant: "destructive",
    //   })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <p className="mb-4">Status: {project.status}</p>
      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)}>Create New Task</Button>
      </div>
      <TaskList 
        tasks={taskList} 
        onEdit={(task) => {
          setEditingTask(task)
          setIsEditModalOpen(true)
        }}
        onDelete={handleDeleteTask}
      />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
      {editingTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingTask(null)
          }}
          onEditTask={(updatedTask) => handleEditTask(editingTask.id, updatedTask)}
          task={editingTask}
        />
      )}
    </div>
  )
}

