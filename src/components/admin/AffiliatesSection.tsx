import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface AffiliateRow {
  id: string;
  referral_code: string;
  email: string;
  status: string;
  total_referred: number;
  conversions: number;
  total_earned_cents: number;
  commission_pct: number;
  stripe_connect_status: "Connected" | "Not Connected";
  payout_status: string;
  created_at: string;
}

interface PayoutResult {
  paid_affiliates: number;
  skipped_affiliates: number;
  failed_affiliates: number;
  total_amount_cents: number;
  message?: string;
}

interface Props {
  adminCall: <T = unknown>(fnName: string, body?: Record<string, unknown>) => Promise<T>;
  onError: (error: unknown) => void;
}

export function AffiliatesSection({ adminCall, onError }: Props) {
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutRunning, setPayoutRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCall<AffiliateRow[]>("admin-get-affiliates");
      setRows(data);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }, [adminCall, onError]);

  useEffect(() => { load(); }, [load]);

  const runPayout = async () => {
    setPayoutRunning(true);
    try {
      const result = await adminCall<PayoutResult>("run-affiliate-payout");
      const parts: string[] = [];
      if (result.paid_affiliates > 0) parts.push(`${result.paid_affiliates} paid ($${(result.total_amount_cents / 100).toFixed(2)})`);
      if (result.skipped_affiliates > 0) parts.push(`${result.skipped_affiliates} skipped`);
      if (result.failed_affiliates > 0) parts.push(`${result.failed_affiliates} failed`);
      toast.success(parts.length > 0 ? `Payout: ${parts.join(", ")}` : result.message || "No pending commissions");
      await load();
    } catch (e) {
      onError(e);
    } finally {
      setPayoutRunning(false);
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Affiliates</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={payoutRunning}>
                <DollarSign className="h-4 w-4 mr-1" />
                {payoutRunning ? "Running…" : "Run Affiliate Payout Batch"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Payout Batch</AlertDialogTitle>
                <AlertDialogDescription>
                  This will process all pending affiliate commissions via Stripe transfers.
                  Affiliates without a connected Stripe account will be skipped. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={runPayout}>Run Payout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading affiliates…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No affiliates found.</p>
      ) : (
        <div className="rounded-md border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral Code</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Referred</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.referral_code}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "active" ? "default" : "secondary"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{r.total_referred}</TableCell>
                  <TableCell className="text-right">{r.conversions}</TableCell>
                  <TableCell className="text-right">{formatCents(r.total_earned_cents)}</TableCell>
                  <TableCell>
                    <Badge variant={r.stripe_connect_status === "Connected" ? "default" : "outline"}>
                      {r.stripe_connect_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      r.payout_status === "paid" ? "default" :
                      r.payout_status === "pending" ? "secondary" : "outline"
                    }>
                      {r.payout_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
