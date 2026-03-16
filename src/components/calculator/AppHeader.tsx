import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save, FolderOpen, Plus, Download, Settings,
  HelpCircle, User, LogOut, ChevronDown, Sun, Moon,
  Pencil, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppHeaderProps {
  projectName: string;
  onProjectNameChange: () => void;
  onSave: () => void;
  onOpenProjects: () => void;
  onNewProject: () => void;
  onEditProject: () => void;
  isSaving: boolean;
  isProjectLocked: boolean;
  hasProject: boolean;
  isDirty: boolean;
  onResetToBlank: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
  canExport?: boolean;
}

export function AppHeader({
  projectName, onProjectNameChange, onSave,
  onOpenProjects, onNewProject, onEditProject,
  isSaving, isProjectLocked, hasProject,
  isDirty, onResetToBlank,
  onExportPDF, onExportCSV, isExporting, canExport,
}: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const exportDisabled = !canExport || isExporting;

  return (
    <header className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
      {/* TFC Logo badge */}
      <button
        className="flex items-center gap-3 mr-2 cursor-pointer"
        onClick={() => {
          if (!isDirty) {
            onResetToBlank();
          } else {
            if (window.confirm("You have unsaved changes. Discard and start fresh?")) {
              onResetToBlank();
            }
          }
        }}
      >
        <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground tracking-wider">
          TFC
        </span>
        <span className="hidden sm:inline text-sm font-medium text-foreground">
          Total Foundation Calculator
        </span>
      </button>

      {/* Project name breadcrumb */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-muted-foreground">/</span>
        <button
          onClick={onEditProject}
          className="rounded px-2 py-1 text-sm text-foreground hover:bg-secondary truncate flex items-center gap-1"
          disabled={!hasProject}
        >
          {projectName || "Untitled Project"}
          {hasProject && <Pencil className="h-3 w-3 text-muted-foreground" />}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Save button — hidden when locked */}
        {!isProjectLocked && (
          <Button variant="ghost" size="sm" onClick={onSave} className="gap-1.5" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isSaving ? "Saving…" : "Save"}</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewProject}>
              <Plus className="h-4 w-4 mr-2" /> New Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenProjects}>
              <FolderOpen className="h-4 w-4 mr-2" /> Open Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenuItem
                      disabled={exportDisabled}
                      onClick={onExportPDF}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export PDF
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {!canExport && (
                  <TooltipContent>Save project to export</TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenuItem
                      disabled={exportDisabled}
                      onClick={onExportCSV}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export CSV
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {!canExport && (
                  <TooltipContent>Save project to export</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
          {theme === "dark"
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" /> Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
