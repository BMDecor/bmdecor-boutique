'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import AuthDialog from '@/components/auth/AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2, Plus } from 'lucide-react';

interface SaveToProjectButtonProps {
  brand: 'BM' | 'FB' | 'LG';
  colorCode: string;
  colorName: string;
  hexCode: string;
}

interface Project {
  id: string;
  name: string;
}

export default function SaveToProjectButton({
  brand,
  colorCode,
  colorName,
  hexCode,
}: SaveToProjectButtonProps) {
  const { isAuthenticated } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch projects when dropdown opens and user is authenticated
  useEffect(() => {
    if (!dropdownOpen || !isAuthenticated) return;

    async function fetchProjects() {
      setIsLoadingProjects(true);
      try {
        const res = await fetch('/api/my-studio/projects');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data.projects ?? data ?? []);
      } catch {
        toast.error('Could not load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    }

    fetchProjects();
  }, [dropdownOpen, isAuthenticated]);

  const handleSaveToProject = async (project: Project) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/my-studio/projects/${project.id}/colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, colorCode, colorName, hexCode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to save color');
      }

      toast.success(`Color saved to ${project.name}`);
      setDropdownOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save color';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProject = () => {
    setDropdownOpen(false);
    window.location.href = '/my-studio/projects?create=true';
  };

  // Unauthenticated: show auth dialog on click
  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAuthOpen(true)}
          className="gap-1.5 text-[#2C2C2C]"
        >
          <Bookmark className="size-4" />
          Save to Project
        </Button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-[#2C2C2C]">
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bookmark className="size-4" />
          )}
          Save to Project
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <DropdownMenuItem onClick={handleCreateProject}>
            <Plus className="size-4 mr-2" />
            Create Project
          </DropdownMenuItem>
        ) : (
          <>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                disabled={isSaving}
                onClick={() => handleSaveToProject(project)}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={handleCreateProject}>
              <Plus className="size-4 mr-2" />
              New Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
