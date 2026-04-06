import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing";
import { useAuth } from "@/hooks/useAuth";
import { callEdgeFunction } from "@/lib/edgeFunctions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";

const CALCULATOR_TYPES = [
  { key: "footings", label: "Footings" },
  { key: "walls", label: "Walls" },
  { key: "grade_beam", label: "Grade Beams" },
  { key: "curb", label: "Curb & Gutter" },
  { key: "slab", label: "Slabs" },
  { key: "pier_pad", label: "Pier Pads" },
  { key: "cylinder", label: "Cylinders" },
  { key: "steps", label: "Steps" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [allOrgs, setAllOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [affiliateCreating, setAffiliateCreating] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Org name
  const [orgName, setOrgName] = useState("");
  const [orgNameLoading, setOrgNameLoading] = useState(false);

  // Billing loading
  const [billingLoading, setBillingLoading] = useState(false);

  // Debounce ref for auto-save
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setUserSettings(settings);

      if (settings?.active_org_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", settings.active_org_id)
          .single();
        setOrg(orgData);
        setOrgName(orgData?.name || "");

        const { data: membersData } = await supabase
          .from("org_members")
          .select("*, users(email)")
          .eq("org_id", settings.active_org_id);
        setMembers(membersData || []);

        const owner = membersData?.find((m: any) => m.user_id === user.id);
        setIsOwner(owner?.role === "owner");

        const { data: invitesData } = await supabase
          .from("org_invites")
          .select("*")
          .eq("org_id", settings.active_org_id)
          .eq("status", "pending");
        setInvites(invitesData || []);
      }

      // All orgs for switcher
      const { data: allMemberships } = await supabase
        .from("org_members")
        .select("org_id, organizations(name)")
        .eq("user_id", user.id)
        .eq("status", "active");
      setAllOrgs(allMemberships || []);

      // Affiliate check
      const { data: affData } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setAffiliate(affData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ?upgraded=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      toast.success("You're now on Pro! Welcome to Total Foundation Calculator Pro.");
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const autoSave = useCallback(
    (field: string, value: any) => {
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await supabase
          .from("user_settings")
          .update({ [field]: value })
          .eq("user_id", user.id);
        toast.success("Saved");
      }, 500);
    },
    [user]
  );

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated.");
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleManageBilling = async () => {
    if (!session || !org) return;
    setBillingLoading(true);
    try {
      const data = await callEdgeFunction<{ url: string }>(
        "create-portal-session",
        { orgId: org.id },
        session
      );
      if (!data.url) throw new Error("Could not open billing portal");
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message);
      setBillingLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!session || !userSettings?.active_org_id) return;
    try {
      setBillingLoading(true);
      await startCheckout(session, userSettings.active_org_id);
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSaveOrgName = async () => {
    if (!org) return;
    setOrgNameLoading(true);
    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName })
      .eq("id", org.id);
    setOrgNameLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Organization name updated.");
  };

  const handleSendInvite = async () => {
    if (!session || !org || !inviteEmail) return;
    setInviteLoading(true);
    try {
      await callEdgeFunction(
        "add-seat",
        { orgId: org.id, email: inviteEmail },
        session
      );
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSuspendMember = async (memberId: string) => {
    if (!session || !org) return;
    try {
      await callEdgeFunction(
        "remove-seat",
        { orgId: org.id, memberId },
        session
      );
      toast.success("Member suspended");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from("org_invites")
      .update({ status: "revoked" })
      .eq("id", inviteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Invite revoked");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }
  };

  const handleSwitchOrg = async (newOrgId: string) => {
    if (!user) return;
    await supabase
      .from("user_settings")
      .update({ active_org_id: newOrgId })
      .eq("user_id", user.id);
    fetchData();
  };

  const toggleCalculator = (key: string, checked: boolean) => {
    const current = userSettings?.visible_calculators || CALCULATOR_TYPES.map((c) => c.key);
    const updated = checked ? [...current, key] : current.filter((k: string) => k !== key);
    setUserSettings((prev: any) => ({ ...prev, visible_calculators: updated }));
    autoSave("visible_calculators", updated);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const tierBadge =
    org?.subscription_tier === "pro" ? (
      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Pro</span>
    ) : (
      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">Free</span>
    );

  const statusText =
    org?.subscription_status === "active" ? (
      <span className="text-xs text-emerald-400">Active</span>
    ) : org?.subscription_status === "past_due" ? (
      <span className="text-xs text-amber-400">Past Due</span>
    ) : org?.subscription_status === "cancelled" ? (
      <span className="text-xs text-muted-foreground">Cancelled</span>
    ) : null;

  const visibleCalcs = userSettings?.visible_calculators || CALCULATOR_TYPES.map((c) => c.key);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Account Settings"
        description="Manage your account, organization, and calculator preferences."
        canonical="https://foundationcalculator.com/settings"
        noIndex={true}
      />
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* SECTION 1 — Account */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email}</span>
            </div>

            <Separator />

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  Change Password
                </Button>
              </div>
              {showPasswordForm && (
                <div className="mt-3 space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button size="sm" onClick={handlePasswordChange} disabled={passwordLoading}>
                    {passwordLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Subscription */}
            {org?.subscription_status === "past_due" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
                Your payment is past due. Please update your payment method to avoid service interruption.
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subscription</span>
              <div className="flex items-center gap-2">
                {tierBadge}
                {statusText}
              </div>
            </div>

            {org?.stripe_customer_id && (
              <Button variant="outline" className="w-full" onClick={handleManageBilling} disabled={billingLoading}>
                {billingLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Manage Billing
              </Button>
            )}

            {org?.subscription_tier === "free" && (
              <Button className="w-full" onClick={handleUpgrade} disabled={billingLoading}>
                {billingLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Org Switcher — visible to all users with multiple orgs */}
        {allOrgs.length > 1 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Switch Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={userSettings?.active_org_id || ""}
                onValueChange={handleSwitchOrg}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allOrgs.map((m: any) => (
                    <SelectItem key={m.org_id} value={m.org_id}>
                      {(m.organizations as any)?.name || m.org_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* SECTION 2 — Organization (owner only) */}
        {isOwner && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Org name */}
              <div className="flex gap-2">
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                <Button size="sm" onClick={handleSaveOrgName} disabled={orgNameLoading}>
                  {orgNameLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save
                </Button>
              </div>

              {/* Team members (pro only) */}
              {org?.subscription_tier === "pro" && (
                <>
                  <Separator />
                  <span className="text-sm font-medium">Team Members</span>
                  <div className="space-y-2">
                    {members
                      .filter((m) => m.status === "active")
                      .map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{m.users?.email || "—"}</span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                              {m.role}
                            </span>
                          </div>
                          {m.user_id !== user?.id && (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleSuspendMember(m.id)}>
                              Suspend
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Invite */}
                  <span className="text-sm font-medium">Invite Team Member</span>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button size="sm" onClick={handleSendInvite} disabled={inviteLoading || !inviteEmail}>
                      {inviteLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Send Invite
                    </Button>
                  </div>

                  {/* Pending invites */}
                  {invites.length > 0 && (
                    <>
                      <span className="text-sm font-medium">Pending Invites</span>
                      <div className="space-y-2">
                        {invites.map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{inv.email}</span>
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Pending</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevokeInvite(inv.id)}>
                              Revoke
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SECTION 3 — Calculator Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Calculator Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visible Calculators */}
            <div>
              <span className="text-sm font-medium">Visible Calculators</span>
              <p className="text-xs text-muted-foreground">Choose which tabs appear in the calculator</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CALCULATOR_TYPES.map((calc) => (
                  <label key={calc.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={visibleCalcs.includes(calc.key)}
                      onCheckedChange={(checked) => toggleCalculator(calc.key, !!checked)}
                    />
                    {calc.label}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Default Rebar Overlap */}
            <div>
              <span className="text-sm font-medium">Default Rebar Overlap</span>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  className="w-24"
                  value={userSettings?.rebar_overlap_in ?? 12}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setUserSettings((prev: any) => ({ ...prev, rebar_overlap_in: val }));
                    autoSave("rebar_overlap_in", val);
                  }}
                />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            </div>

            <Separator />

            {/* Units */}
            <div>
              <span className="text-sm font-medium">Units</span>
              <Select
                value={userSettings?.units || "imperial"}
                onValueChange={(val) => {
                  setUserSettings((prev: any) => ({ ...prev, units: val }));
                  autoSave("units", val);
                }}
              >
                <SelectTrigger className="mt-1 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">Imperial</SelectItem>
                  <SelectItem value="metric">Metric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div>
              <span className="text-sm font-medium">Language</span>
              <Select
                value={userSettings?.language || "en"}
                onValueChange={(val) => {
                  setUserSettings((prev: any) => ({ ...prev, language: val }));
                  autoSave("language", val);
                }}
              >
                <SelectTrigger className="mt-1 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4 — Affiliate Program */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Affiliate Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {affiliate ? (
              <>
                <p className="text-sm text-muted-foreground">You're an affiliate! View your dashboard to track referrals and earnings.</p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/affiliate")}>
                  View Affiliate Dashboard
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Earn commissions by referring other contractors to Foundation Calculator. Get a unique referral link and earn 20% on every paid subscription.
                </p>
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!session) return;
                    setAffiliateCreating(true);
                    try {
                      await callEdgeFunction("create-affiliate-account", {}, session);
                      navigate("/affiliate");
                    } catch (e: any) {
                      toast.error(e.message || "Failed to create affiliate account");
                    } finally {
                      setAffiliateCreating(false);
                    }
                  }}
                  disabled={affiliateCreating}
                >
                  {affiliateCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Become an Affiliate
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* SECTION — Help & Documentation */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Help & Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/how-it-works")}>
              How Calculations Work
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
