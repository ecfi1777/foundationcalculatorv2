import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2, AlertTriangle, Users, TrendingUp, UserCheck, Clock, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralLinkCard } from "@/components/affiliate/ReferralLinkCard";
import { PayoutHistoryTable } from "@/components/affiliate/PayoutHistoryTable";

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    totalSignups: 0,
    totalConversions: 0,
    activeReferrals: 0,
    pendingCommissionCents: 0,
    totalEarnedCents: 0,
  });
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // 1. Get affiliate
      const { data: aff } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!aff) {
        navigate("/settings", { replace: true });
        return;
      }
      setAffiliate(aff);

      // 2. Get referrals
      const { data: referrals } = await supabase
        .from("referrals")
        .select("id, status")
        .eq("affiliate_id", aff.id);

      const refs = referrals || [];
      const totalSignups = refs.length;
      const converted = refs.filter((r) => r.status === "converted");

      // 3. Get commissions
      const { data: commissions } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", aff.id);

      const comms = commissions || [];
      const pendingCommissionCents = comms
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + (c.amount_cents || 0), 0);

      const paidPayouts = comms
        .filter((c) => c.status === "paid")
        .sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime());

      setMetrics({
        totalSignups,
        totalConversions: converted.length,
        activeReferrals: converted.length,
        pendingCommissionCents,
        totalEarnedCents: aff.total_earned_cents || 0,
      });
      setPayouts(paidPayouts);
      setLoading(false);
    };

    load();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Next payout = 1st of next month
  const now = new Date();
  const nextPayout = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextPayoutStr = nextPayout.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const metricCards = [
    { label: "Total Signups", value: metrics.totalSignups, icon: Users },
    { label: "Total Conversions", value: metrics.totalConversions, icon: TrendingUp },
    { label: "Active Referrals", value: metrics.activeReferrals, icon: UserCheck },
    { label: "Pending Commission", value: formatCurrency(metrics.pendingCommissionCents), icon: Clock },
    { label: "Total Earned", value: formatCurrency(metrics.totalEarnedCents), icon: DollarSign },
    { label: "Next Payout Date", value: nextPayoutStr, icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Affiliate Dashboard</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Stripe Connect placeholder */}
        {!affiliate?.stripe_connect_id && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-400">
              Connect your Stripe account to receive payouts. (Coming soon)
            </p>
          </div>
        )}

        {/* Referral Link */}
        <ReferralLinkCard referralLink={affiliate?.referral_link || ""} />

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metricCards.map((m) => (
            <Card key={m.label} className="bg-card border-border">
              <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                <m.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">{m.value}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payout History */}
        <PayoutHistoryTable payouts={payouts} />
      </div>
    </div>
  );
}
