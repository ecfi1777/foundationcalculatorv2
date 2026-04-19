import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { attachReferralIfNeeded } from "@/lib/migrateAnonData";
import { hasAnonData, captureRefCode } from "@/lib/localStorage";
import { peekAuthIntent, clearAuthIntent } from "@/lib/authIntent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { SEO } from "@/components/SEO";

function PasswordInput({
  id,
  value,
  onChange,
  minLength,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
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

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const successfulAuthRef = useRef(false);

  useEffect(() => {
    captureRefCode();
  }, []);

  // Clear intent only on abandoned auth (unmount without successful login).
  useEffect(() => {
    return () => {
      if (!successfulAuthRef.current) {
        clearAuthIntent();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      successfulAuthRef.current = true;
      const postLogin = async () => {
        await attachReferralIfNeeded(user.id);
        const intent = peekAuthIntent();
        // migrateAnonData is deprecated. Every realistic anon-save entry point
        // now flows through the auth handoff (SaveBanner, header Save, header
        // Sign In, AccountCreationModal), all of which set an intent and stash
        // the draft in sessionStorage. /app's WorkspaceShell consumes the
        // handoff on mount and auto-saves it as "Untitled Project" via
        // saveProject, which correctly handles rebar, stone, and all the gaps
        // migrateAnonData had. Default destination is /app so users with
        // abandoned localStorage still land inside the app.
        const dest = intent?.redirectTo ?? "/app";
        navigate(dest, { replace: true });
      };
      postLogin();
    }
  }, [user, loading, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a password reset link.");
      setForgotMode(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (error) toast.error(String(error));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SEO
        title="Sign In"
        description="Sign in to your Total Foundation Calculator account."
        canonical="https://foundationcalculator.com/auth"
        noIndex={true}
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Total Foundation Calculator
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {forgotMode
              ? "Enter your email to reset your password"
              : hasAnonData()
                ? "Create an account to save your work"
                : "Sign in to your account"}
          </CardDescription>
          {!forgotMode && (
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/")}
            >
              ← Continue to calculator without an account
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm text-muted-foreground"
                onClick={() => setForgotMode(false)}
              >
                ← Back to sign in
              </Button>
            </form>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleEmailLogin} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="login-password">Password</Label>
                      <PasswordInput
                        id="login-password"
                        value={loginPassword}
                        onChange={setLoginPassword}
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Signing in…" : "Sign In"}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-muted-foreground"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setForgotMode(true);
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleEmailSignup} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInput
                        id="signup-password"
                        value={signupPassword}
                        onChange={setSignupPassword}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Creating account…" : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
