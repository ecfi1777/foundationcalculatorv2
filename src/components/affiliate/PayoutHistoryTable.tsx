import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Payout {
  id: string;
  paid_at: string | null;
  amount_cents: number;
  stripe_transfer_id: string | null;
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  ${(p.amount_cents / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-sm font-mono text-xs text-muted-foreground">
                  {p.stripe_transfer_id || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
