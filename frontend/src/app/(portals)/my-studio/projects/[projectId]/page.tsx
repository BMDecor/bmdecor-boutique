'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavedColor {
  brand: 'BM' | 'FB' | 'LG';
  colorCode: string;
  colorName: string;
  hexCode: string;
  notes?: string;
}

interface Project {
  projectId: string;
  name: string;
  description?: string;
  colors: SavedColor[];
  createdAt: string;
  updatedAt: string;
}

const brandLabels: Record<string, string> = {
  BM: 'Benjamin Moore',
  FB: 'Farrow & Ball',
  LG: 'Little Greene',
};

const brandBadgeStyles: Record<string, string> = {
  BM: 'bg-[#2C2C2C] text-white',
  FB: 'bg-[#4A5568] text-white',
  LG: 'bg-[#2D6A4F] text-white',
};

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/my-studio/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setNameValue(data.name);
      } else if (res.status === 404) {
        router.push('/my-studio/projects');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function handleSaveName() {
    if (!nameValue.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/my-studio/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject((prev) => prev ? { ...prev, name: updated.name, updatedAt: updated.updatedAt } : prev);
        setEditingName(false);
      }
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveColor(colorCode: string, brand: string) {
    try {
      const res = await fetch(`/api/my-studio/projects/${projectId}/colors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorCode, brand }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject((prev) => prev ? { ...prev, colors: updated.colors, updatedAt: updated.updatedAt } : prev);
      }
    } catch (error) {
      console.error('Failed to remove color:', error);
    }
  }

  async function handleDownloadPdf() {
    try {
      const res = await fetch(`/api/my-studio/projects/${projectId}/pdf`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/pdf')) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project?.name || 'palette'}-sheet.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const data = await res.json();
          alert(data.message || 'PDF generation coming soon.');
        }
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#2C2C2C]/60 text-sm tracking-wide">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[#2C2C2C]/60 text-sm">Project not found.</p>
        <Link
          href="/my-studio/projects"
          className="text-[#C9A86C] hover:text-[#B8975B] text-sm underline underline-offset-4 mt-2 inline-block"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/my-studio/projects"
        className="text-[#2C2C2C]/50 hover:text-[#C9A86C] text-sm transition-colors"
      >
        &larr; Back to Projects
      </Link>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] bg-transparent border-b-2 border-[#C9A86C] outline-none pb-1 w-full"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="text-[#C9A86C] hover:text-[#B8975B] text-sm shrink-0"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setNameValue(project.name);
                  setEditingName(false);
                }}
                className="text-[#2C2C2C]/40 hover:text-[#2C2C2C]/60 text-sm shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] cursor-pointer hover:text-[#C9A86C] transition-colors"
              title="Click to edit"
            >
              {project.name}
            </h2>
          )}

          {project.description && (
            <p className="text-[#2C2C2C]/60 text-sm mt-2">{project.description}</p>
          )}
        </div>

        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 border border-[#E8E2D9] text-[#2C2C2C] text-sm rounded hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors shrink-0"
        >
          Download Palette Sheet (PDF)
        </button>
      </div>

      {/* Color grid */}
      {project.colors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#E8E2D9]">
          <p className="text-[#2C2C2C]/60 text-sm">
            No colors saved to this project yet.
          </p>
          <p className="text-[#2C2C2C]/40 text-xs mt-1">
            Browse our collections and save colors here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.colors.map((color, idx) => (
            <div
              key={`${color.brand}-${color.colorCode}-${idx}`}
              className="bg-white rounded-lg border border-[#E8E2D9] overflow-hidden group"
            >
              {/* Color swatch */}
              <div
                className="h-24 w-full"
                style={{ backgroundColor: color.hexCode }}
              />

              {/* Color info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[#2C2C2C] font-medium text-sm truncate">
                      {color.colorName}
                    </p>
                    <p className="text-[#2C2C2C]/50 text-xs font-mono mt-0.5">
                      {color.colorCode}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shrink-0 ${
                      brandBadgeStyles[color.brand] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {color.brand}
                  </span>
                </div>

                {color.notes && (
                  <p className="text-[#2C2C2C]/50 text-xs mt-2 italic">{color.notes}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8E2D9]">
                  <p className="text-[#2C2C2C]/30 text-[10px] uppercase tracking-[0.1em]">
                    {brandLabels[color.brand] || color.brand}
                  </p>
                  <button
                    onClick={() => handleRemoveColor(color.colorCode, color.brand)}
                    className="text-[#2C2C2C]/30 hover:text-red-500 text-xs transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
