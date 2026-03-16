import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface AdminOrg {
  id: string;
  name: string;
  owner_email: string | null;
  seat_count: number;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
}

interface Props {
  adminCall: <T = unknown>(fn: string, body?: Record<string, unknown>) => Promise<T>;
  onError: (error: unknown) => void;
}

export function OrganizationsSection({ adminCall, onError }: Props) {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCall<AdminOrg[]>("admin-get-organizations");
      setOrgs(data);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }, [adminCall, onError]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Organizations</h2>
        <Button variant="outline" size="sm" onClick={fetchOrgs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orgs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No organizations found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Org Name</TableHead>
              <TableHead>Owner Email</TableHead>
              <TableHead>Seat Count</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.owner_email || "—"}</TableCell>
                <TableCell>{o.seat_count}</TableCell>
                <TableCell>
                  <Badge variant={o.subscription_tier === "pro" ? "default" : "secondary"}>
                    {o.subscription_tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={o.subscription_status === "active" ? "default" : "destructive"}>
                    {o.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell>{fmtDate(o.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
