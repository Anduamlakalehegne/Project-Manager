import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Project } from '@/lib/api'
import { Edit, Trash2 } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {project.name}
          <div>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge>{project.status}</Badge>
      </CardContent>
      <CardFooter>
        <Link href={`/project/${project.id}`} passHref>
          <Button>View Project</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

