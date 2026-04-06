import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { SEO } from "@/components/SEO";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase redirects with #access_token=...&type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully.");
      navigate("/");
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-foreground">Invalid Reset Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              This link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="w-full" onClick={() => navigate("/auth")}>
              ← Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground">Set New Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInput id="new-password" value={password} onChange={setPassword} />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || password.length < 6}>
              {submitting ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
