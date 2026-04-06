import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { callEdgeFunction } from "@/lib/edgeFunctions";
import { ArrowLeft, Loader2, AlertTriangle, Users, TrendingUp, UserCheck, Clock, DollarSign, Calendar, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReferralLinkCard } from "@/components/affiliate/ReferralLinkCard";
import { PayoutHistoryTable } from "@/components/affiliate/PayoutHistoryTable";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

interface StripeConnectStatus {
  connected: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  stripe_connect_id: string | null;
}

interface DashboardStats {
  total_signups: number;
  total_conversions: number;
  active_referrals: number;
  pending_commission_cents: number;
  total_earned_cents: number;
}

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
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
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    if (!user || !session) return;

    const load = async () => {
      setLoading(true);

      // 1. Get affiliate
      const { data: aff, error: affErr } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (affErr) {
        toast({ title: "Failed to load affiliate data", description: affErr.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!aff) {
        navigate("/settings", { replace: true });
        return;
      }
      setAffiliate(aff);

      // 2. Get dashboard stats via single RPC (replaces 3 separate queries)
      const { data: stats, error: statsErr } = await supabase.rpc(
        "get_affiliate_dashboard_stats",
        { affiliate_id: aff.id }
      );

      if (statsErr) {
        console.error("Failed to fetch dashboard stats:", statsErr);
      }

      const dashStats = (stats as unknown as DashboardStats) || {
        total_signups: 0,
        total_conversions: 0,
        active_referrals: 0,
        pending_commission_cents: 0,
        total_earned_cents: 0,
      };

      setMetrics({
        totalSignups: dashStats.total_signups,
        totalConversions: dashStats.total_conversions,
        activeReferrals: dashStats.active_referrals,
        pendingCommissionCents: dashStats.pending_commission_cents,
        totalEarnedCents: dashStats.total_earned_cents,
      });

      // 3. Get paid commissions for payout history table (separate query needed for row data)
      const { data: paidComms, error: payoutsErr } = await supabase
        .from("affiliate_commissions")
        .select("id, paid_at, amount_cents, stripe_transfer_id")
        .eq("affiliate_id", aff.id)
        .eq("status", "paid")
        .order("paid_at", { ascending: false });

      if (payoutsErr) {
        toast({ title: "Failed to load payout history", description: payoutsErr.message, variant: "destructive" });
      }

      setPayouts(paidComms || []);
      setLoading(false);

      // 4. Get Stripe Connect status
      setStripeLoading(true);
      try {
        const status = await callEdgeFunction<StripeConnectStatus>(
          "get-stripe-connect-status",
          {},
          session
        );
        setStripeStatus(status);
      } catch (err) {
        console.error("Failed to fetch Stripe Connect status:", err);
        setStripeStatus({ connected: false, payouts_enabled: false, details_submitted: false, stripe_connect_id: null });
      } finally {
        setStripeLoading(false);
      }
    };

    load();
  }, [user, session, navigate]);

  const handleConnectStripe = async () => {
    if (!session) return;
    setOnboardingLoading(true);
    try {
      const { url } = await callEdgeFunction<{ url: string }>(
        "create-stripe-connect-onboarding-link",
        {},
        session
      );
      window.location.href = url;
    } catch (err) {
      console.error("Failed to create onboarding link:", err);
      toast({ title: "Failed to create affiliate account", description: "Could not generate Stripe onboarding link. Please try again.", variant: "destructive" });
      setOnboardingLoading(false);
    }
  };

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

  // Stripe Connect card rendering
  const renderStripeConnectCard = () => {
    if (stripeLoading) {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking payout account status…</p>
        </div>
      );
    }

    if (!stripeStatus || (!stripeStatus.connected && !stripeStatus.stripe_connect_id)) {
      // Case A: No Stripe account
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-400">
              You're earning commissions! Connect your Stripe account to receive payouts.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleConnectStripe}
            disabled={onboardingLoading}
          >
            {onboardingLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Connect Stripe
          </Button>
        </div>
      );
    }

    if (stripeStatus.connected && !stripeStatus.payouts_enabled) {
      // Case B: Onboarding incomplete
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-400">
              Your Stripe account setup is incomplete. Finish onboarding to receive payouts.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleConnectStripe}
            disabled={onboardingLoading}
          >
            {onboardingLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Continue Setup
          </Button>
        </div>
      );
    }

    // Case C: Payouts enabled
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
        <p className="text-sm text-green-400">
          Stripe account connected — Payouts enabled
        </p>
      </div>
    );
  };

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
        {/* Stripe Connect Status */}
        {renderStripeConnectCard()}

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
