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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
}

export function AppHeader({ projectName, onProjectNameChange, onSave }: AppHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
      {/* TFC Logo badge */}
      <div className="flex items-center gap-3 mr-2">
        <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground tracking-wider">
          TFC
        </span>
        <span className="hidden sm:inline text-sm font-medium text-foreground">
          Total Foundation Calculator
        </span>
      </div>

      {/* Project name breadcrumb */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-muted-foreground">/</span>
        {isEditingName ? (
          <Input
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            className="h-7 w-48 bg-input text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="rounded px-2 py-1 text-sm text-foreground hover:bg-secondary truncate"
          >
            {projectName || "Untitled Project"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onSave} className="gap-1.5">
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Stubs — wired in Phase 8 */}
            <DropdownMenuItem disabled>
              <Plus className="h-4 w-4 mr-2" /> New Project
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <FolderOpen className="h-4 w-4 mr-2" /> Open Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </DropdownMenuItem>
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
