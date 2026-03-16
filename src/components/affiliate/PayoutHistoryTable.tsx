import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Payout {
  id: string;
  paid_at: string | null;
  amount_cents: number;
  stripe_transfer_id: string | null;
}

/**
 * Grouped payout row derived from commission data.
 * Grouping is by stripe_transfer_id when present.
 * No "payout batch" objects are invented — all data is derived from actual commissions.
 */
interface GroupedPayout {
  key: string;
  date: string;
  totalCents: number;
  transferId: string | null;
  commissionCount: number;
}

function groupPayouts(payouts: Payout[]): GroupedPayout[] {
  const grouped: Record<string, Payout[]> = {};
  const ungrouped: Payout[] = [];

  for (const p of payouts) {
    if (p.stripe_transfer_id) {
      if (!grouped[p.stripe_transfer_id]) {
        grouped[p.stripe_transfer_id] = [];
      }
      grouped[p.stripe_transfer_id].push(p);
    } else {
      // No transfer ID — fall back to row-level display
      ungrouped.push(p);
    }
  }

  const result: GroupedPayout[] = [];

  // Process grouped payouts
  for (const [transferId, rows] of Object.entries(grouped)) {
    const totalCents = rows.reduce((sum, r) => sum + r.amount_cents, 0);

    // Determine representative date:
    // If all paid_at dates are the same (shared transfer payout date), use that.
    // Otherwise, use the latest paid_at within the group for deterministic display.
    const dates = rows.map((r) => r.paid_at).filter(Boolean) as string[];
    const uniqueDates = new Set(dates.map((d) => new Date(d).toDateString()));
    let representativeDate: string;
    if (uniqueDates.size === 1 && dates.length > 0) {
      // All commissions share the same payout date — use it directly
      representativeDate = dates[0];
    } else if (dates.length > 0) {
      // Dates differ — use the latest paid_at for deterministic display
      representativeDate = dates.sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      )[0];
    } else {
      representativeDate = "";
    }

    result.push({
      key: transferId,
      date: representativeDate,
      totalCents,
      transferId,
      commissionCount: rows.length,
    });
  }

  // Process ungrouped (no transfer ID) as individual rows
  for (const p of ungrouped) {
    result.push({
      key: p.id,
      date: p.paid_at || "",
      totalCents: p.amount_cents,
      transferId: null,
      commissionCount: 1,
    });
  }

  // Sort by date descending
  result.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return result;
}

interface PayoutHistoryTableProps {
  payouts: Payout[];
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  if (!payouts || payouts.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payouts yet</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupPayouts(payouts);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Payout History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transfer ID</TableHead>
              <TableHead className="text-right">Commissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map((g) => (
              <TableRow key={g.key}>
                <TableCell className="text-sm">
                  {g.date ? new Date(g.date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  ${(g.totalCents / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-sm font-mono text-xs text-muted-foreground">
                  {g.transferId || "—"}
                </TableCell>
                <TableCell className="text-sm text-right">
                  {g.commissionCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
