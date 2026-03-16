import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Users, Building2, FolderOpen, Activity } from "lucide-react";

interface UsageStats {
  total_users: number;
  paid_organizations: number;
  free_organizations: number;
  projects_all_time: number;
  projects_last_30_days: number;
  active_users_7_days: number;
}

interface Props {
  adminCall: <T = unknown>(fn: string, body?: Record<string, unknown>) => Promise<T>;
  onError: (error: unknown) => void;
}

const statCards: { key: keyof UsageStats; label: string; icon: React.ReactNode }[] = [
  { key: "total_users", label: "Total Users", icon: <Users className="h-5 w-5 text-muted-foreground" /> },
  { key: "paid_organizations", label: "Paid Organizations", icon: <Building2 className="h-5 w-5 text-primary" /> },
  { key: "free_organizations", label: "Free Organizations", icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
  { key: "projects_all_time", label: "Projects (All Time)", icon: <FolderOpen className="h-5 w-5 text-muted-foreground" /> },
  { key: "projects_last_30_days", label: "Projects (Last 30 Days)", icon: <FolderOpen className="h-5 w-5 text-primary" /> },
  { key: "active_users_7_days", label: "Active Users (7 Days)", icon: <Activity className="h-5 w-5 text-primary" /> },
];

export function UsageStatsSection({ adminCall, onError }: Props) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCall<UsageStats>("admin-get-usage-stats");
      setStats(data);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }, [adminCall, onError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Usage Stats</h2>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !stats ? (
        <p className="text-muted-foreground text-center py-12">Failed to load stats.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {stats[s.key].toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
