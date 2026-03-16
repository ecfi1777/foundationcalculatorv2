import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  org_name: string | null;
  org_id: string | null;
  subscription_tier: string;
  subscription_status: string;
  stripe_sub_id: string | null;
}

interface Props {
  adminCall: <T = unknown>(fn: string, body?: Record<string, unknown>) => Promise<T>;
  onError: (error: unknown) => void;
}

export function UsersSection({ adminCall, onError }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ user: AdminUser; action: "toggle_pro" | "revert_free" } | null>(null);
  const [acting, setActing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCall<AdminUser[]>("admin-get-users");
      setUsers(data);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }, [adminCall, onError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async () => {
    if (!confirm) return;
    setActing(true);
    try {
      await adminCall("admin-toggle-pro", {
        orgId: confirm.user.org_id,
        action: confirm.action,
      });
      toast.success(confirm.action === "toggle_pro" ? "Upgraded to Pro" : "Reverted to Free");
      setConfirm(null);
      fetchUsers();
    } catch (e) {
      onError(e);
    } finally {
      setActing(false);
    }
  };

  const isAdminOverride = (u: AdminUser) =>
    !u.stripe_sub_id && u.subscription_tier === "pro";

  const fmtDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Users</h2>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No users found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>{u.org_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.subscription_tier === "pro" ? "default" : "secondary"}>
                    {u.subscription_tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.subscription_status === "active" ? "default" : "destructive"}>
                    {u.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell>{fmtDate(u.created_at)}</TableCell>
                <TableCell>{fmtDate(u.updated_at)}</TableCell>
                <TableCell>
                  {u.org_id && u.subscription_tier === "free" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirm({ user: u, action: "toggle_pro" })}
                    >
                      Toggle to Pro
                    </Button>
                  )}
                  {u.org_id && isAdminOverride(u) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirm({ user: u, action: "revert_free" })}
                    >
                      Revert to Free
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "toggle_pro" ? "Upgrade to Pro?" : "Revert to Free?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "toggle_pro"
                ? `This will set ${confirm?.user.email}'s organization to Pro and unlock all projects. This is an admin override — no Stripe subscription will be created.`
                : `This will revert ${confirm?.user.email}'s organization to Free and lock all projects.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} disabled={acting}>
              {acting ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
