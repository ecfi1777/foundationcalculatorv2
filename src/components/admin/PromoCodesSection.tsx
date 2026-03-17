import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Plus, Pencil, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  type: string;
  discount_pct: number | null;
  discount_cents: number | null;
  trial_days: number | null;
  grants_premium: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface Props {
  adminCall: <T = unknown>(fn: string, body?: Record<string, unknown>) => Promise<T>;
  onError: (error: unknown) => void;
}

const PROMO_TYPES = ["pct_discount", "flat_discount", "trial", "full_unlock"] as const;

function formatDiscount(p: PromoCode): string {
  switch (p.type) {
    case "pct_discount": return `${p.discount_pct}%`;
    case "flat_discount": return `$${((p.discount_cents || 0) / 100).toFixed(2)}`;
    case "trial": return `${p.trial_days} days`;
    case "full_unlock": return "Full Unlock";
    default: return "—";
  }
}

const emptyForm = {
  code: "",
  type: "pct_discount" as string,
  discount_pct: "",
  discount_cents: "",
  trial_days: "",
  max_uses: "",
  expires_at: "",
  is_active: true,
  grants_premium: true,
};

export function PromoCodesSection({ adminCall, onError }: Props) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCall<PromoCode[]>("admin-get-promo-codes");
      setPromos(data);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }, [adminCall, onError]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setForm({
      code: p.code,
      type: p.type,
      discount_pct: p.discount_pct?.toString() || "",
      discount_cents: p.discount_cents?.toString() || "",
      trial_days: p.trial_days?.toString() || "",
      max_uses: p.max_uses?.toString() || "",
      expires_at: p.expires_at ? p.expires_at.substring(0, 10) : "",
      is_active: p.is_active,
      grants_premium: p.grants_premium,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: form.code,
        type: form.type,
        is_active: form.is_active,
        grants_premium: form.grants_premium,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        discount_pct: form.type === "pct_discount" && form.discount_pct ? parseInt(form.discount_pct) : null,
        discount_cents: form.type === "flat_discount" && form.discount_cents ? parseInt(form.discount_cents) : null,
        trial_days: form.type === "trial" && form.trial_days ? parseInt(form.trial_days) : null,
      };

      if (editing) {
        body.id = editing.id;
        await adminCall("admin-update-promo", body);
        toast.success("Promo updated");
      } else {
        await adminCall("admin-create-promo", body);
        toast.success("Promo created");
      }
      setDialogOpen(false);
      fetchPromos();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await adminCall("admin-deactivate-promo", { id: deactivateId });
      toast.success("Promo deactivated");
      setDeactivateId(null);
      fetchPromos();
    } catch (e) {
      onError(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Promo Codes</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPromos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : promos.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No promo codes found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Max Uses</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-medium">{p.code}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>{formatDiscount(p)}</TableCell>
                <TableCell>{p.max_uses ?? "∞"}</TableCell>
                <TableCell>{p.uses_count}</TableCell>
                <TableCell>
                  {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "destructive"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {p.is_active && (
                      <Button size="sm" variant="ghost" onClick={() => setDeactivateId(p.id)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROMO_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.type === "pct_discount" && (
              <div>
                <Label>Discount %</Label>
                <Input type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} />
              </div>
            )}
            {form.type === "flat_discount" && (
              <div>
                <Label>Discount (cents)</Label>
                <Input type="number" value={form.discount_cents} onChange={(e) => setForm({ ...form, discount_cents: e.target.value })} />
              </div>
            )}
            {form.type === "trial" && (
              <div>
                <Label>Trial Days</Label>
                <Input type="number" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: e.target.value })} />
              </div>
            )}
            <div>
              <Label>Max Uses (blank = unlimited)</Label>
              <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            </div>
            <div>
              <Label>Expires At</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: !!c })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Promo Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the promo code to inactive. It can be reactivated via edit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
