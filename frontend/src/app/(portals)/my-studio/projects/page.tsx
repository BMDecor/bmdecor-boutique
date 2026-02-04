'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SavedColor {
  brand: 'BM' | 'FB' | 'LG';
  colorCode: string;
  colorName: string;
  hexCode: string;
  notes?: string;
}

interface ProjectSummary {
  projectId: string;
  name: string;
  description?: string;
  colorCount: number;
  colors: SavedColor[];
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/my-studio/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/my-studio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNewName('');
        setNewDescription('');
        setDialogOpen(false);
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#2C2C2C]/60 text-sm tracking-wide">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
          My Projects
        </h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-[#C9A86C] text-white text-sm rounded hover:bg-[#B8975B] transition-colors">
              New Project
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E8E2D9]">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C]">
                Create New Project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-[#2C2C2C]/70 text-xs uppercase tracking-[0.1em] block mb-1.5">
                  Project Name
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Living Room Refresh"
                  className="border-[#E8E2D9] focus-visible:ring-[#C9A86C]/30 focus-visible:border-[#C9A86C]"
                />
              </div>
              <div>
                <label className="text-[#2C2C2C]/70 text-xs uppercase tracking-[0.1em] block mb-1.5">
                  Description (optional)
                </label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A few words about this project"
                  className="border-[#E8E2D9] focus-visible:ring-[#C9A86C]/30 focus-visible:border-[#C9A86C]"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="w-full py-2.5 bg-[#C9A86C] text-white text-sm rounded hover:bg-[#B8975B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-3">
            No projects yet
          </h3>
          <p className="text-[#2C2C2C]/60 text-sm max-w-md mx-auto">
            Start saving colors from our brand collections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const date = new Date(project.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Link
                key={project.projectId}
                href={`/my-studio/projects/${project.projectId}`}
                className="group bg-white rounded-lg border border-[#E8E2D9] p-6 hover:border-[#C9A86C] transition-colors"
              >
                <h3 className="text-[#2C2C2C] font-medium group-hover:text-[#C9A86C] transition-colors truncate">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-[#2C2C2C]/50 text-sm mt-1 truncate">
                    {project.description}
                  </p>
                )}

                {/* Color swatch previews */}
                <div className="flex gap-1.5 mt-4">
                  {project.colors.length > 0 ? (
                    project.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-7 h-7 rounded-full border border-[#E8E2D9]"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.colorName}
                      />
                    ))
                  ) : (
                    <div className="w-7 h-7 rounded-full border border-dashed border-[#E8E2D9]" />
                  )}
                  {project.colorCount > 5 && (
                    <div className="w-7 h-7 rounded-full border border-[#E8E2D9] bg-[#FAF8F5] flex items-center justify-center">
                      <span className="text-[#2C2C2C]/50 text-[10px]">
                        +{project.colorCount - 5}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-[#2C2C2C]/40 text-xs">
                    {project.colorCount} {project.colorCount === 1 ? 'color' : 'colors'}
                  </p>
                  <p className="text-[#2C2C2C]/40 text-xs">{date}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
