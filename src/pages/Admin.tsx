import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { callEdgeFunction } from "@/lib/edgeFunctions";
import { UsersSection } from "@/components/admin/UsersSection";
import { OrganizationsSection } from "@/components/admin/OrganizationsSection";
import { PromoCodesSection } from "@/components/admin/PromoCodesSection";
import { UsageStatsSection } from "@/components/admin/UsageStatsSection";
import { AffiliatesSection } from "@/components/admin/AffiliatesSection";
import { Button } from "@/components/ui/button";
import { Users, Building2, Tag, BarChart3, Handshake } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

type AdminTab = "users" | "organizations" | "promos" | "stats" | "affiliates";

const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { key: "organizations", label: "Organizations", icon: <Building2 className="h-4 w-4" /> },
  { key: "promos", label: "Promo Codes", icon: <Tag className="h-4 w-4" /> },
  { key: "affiliates", label: "Affiliates", icon: <Handshake className="h-4 w-4" /> },
  { key: "stats", label: "Usage Stats", icon: <BarChart3 className="h-4 w-4" /> },
];

export default function Admin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const handleAdminError = useCallback(
    (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("Forbidden") || msg.includes("403")) {
        toast.error("Access denied. Redirecting...");
        navigate("/", { replace: true });
      } else {
        toast.error(msg);
      }
    },
    [navigate]
  );

  const adminCall = useCallback(
    async <T = unknown>(fnName: string, body: Record<string, unknown> = {}): Promise<T> => {
      if (!session) throw new Error("Not authenticated");
      return callEdgeFunction<T>(fnName, body, session);
    },
    [session]
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card p-4 flex flex-col gap-1">
        <h1 className="text-lg font-bold text-foreground mb-4">Admin</h1>
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={activeTab === t.key ? "default" : "ghost"}
            className="justify-start gap-2 w-full"
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
          </Button>
        ))}
        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
            ← Back
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "users" && (
          <UsersSection adminCall={adminCall} onError={handleAdminError} />
        )}
        {activeTab === "organizations" && (
          <OrganizationsSection adminCall={adminCall} onError={handleAdminError} />
        )}
        {activeTab === "promos" && (
          <PromoCodesSection adminCall={adminCall} onError={handleAdminError} />
        )}
        {activeTab === "affiliates" && (
          <AffiliatesSection adminCall={adminCall} onError={handleAdminError} />
        )}
        {activeTab === "stats" && (
          <UsageStatsSection adminCall={adminCall} onError={handleAdminError} />
        )}
      </main>
    </div>
  );
}
