import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { SaveWorkPrompt } from "@/components/SaveWorkPrompt";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  // Capture ?ref=CODE on first load
  useEffect(() => {
    captureRefCode();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Total Foundation Calculator V2
        </h1>
        <p className="text-muted-foreground">
          {loading
            ? "Loading…"
            : user
            ? `Signed in as ${user.email}`
            : "Working anonymously — your data is saved locally"}
        </p>
        <div className="flex gap-3 justify-center">
          {!loading && !user && (
            <>
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
              <Button variant="outline" onClick={() => setShowPrompt(true)}>
                Why create an account?
              </Button>
            </>
          )}
          {!loading && user && (
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
      </div>
      <SaveWorkPrompt open={showPrompt} onOpenChange={setShowPrompt} />
    </div>
  );
};

export default Index;
