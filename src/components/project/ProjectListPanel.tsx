import { useState, useEffect } from "react";
import { useProject, type Project } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lock, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProjectListPanel({ open, onClose }: Props) {
  const {
    projects, currentProject, loadProjects, loadProject,
    deleteProject, isDirty, isLoading,
  } = useProject();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [discardTarget, setDiscardTarget] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadProjects();
  }, [open, loadProjects]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (isLoading) return;

    if (isDirty) {
      setDiscardTarget(id);
    } else {
      loadProject(id);
      onClose();
    }
  };

  const confirmDiscard = () => {
    if (discardTarget) {
      loadProject(discardTarget);
      setDiscardTarget(null);
      onClose();
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="left" className="w-[360px] bg-card border-border p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-foreground">Projects</SheetTitle>
          </SheetHeader>

          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-9 bg-input"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {projects.length === 0
                    ? "No saved projects yet. Start calculating and hit Save."
                    : "No matching projects"}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    disabled={isLoading}
                    className={`w-full text-left rounded-lg p-3 transition-colors group ${
                      currentProject?.id === p.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/30 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate flex-1">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {p.is_locked && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Upgrade to edit
                          </span>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(p);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {p.notes && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{p.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Discard unsaved changes confirmation */}
      <ConfirmDialog
        open={!!discardTarget}
        onClose={() => setDiscardTarget(null)}
        onConfirm={confirmDiscard}
        title="Unsaved Changes"
        description="You have unsaved changes. Discard and open this project?"
        confirmLabel="Discard and Open"
        variant="default"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This project will be removed from your project list. Your data will not be recoverable."
        confirmLabel="Delete Project"
        variant="destructive"
      />
    </>
  );
}
