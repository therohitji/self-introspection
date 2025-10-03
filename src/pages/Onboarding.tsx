import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [intention, setIntention] = useState("");
  const [timeBudget, setTimeBudget] = useState("20");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleStart = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          intention,
          time_budget: parseInt(timeBudget),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("events").insert({
        user_id: user.id,
        type: "started_questionnaire",
        metadata: { session_id: session.id },
      });

      navigate(`/questions?session=${session.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to Introspection OS</h1>
          <p className="text-muted">Let's set your intention before we begin.</p>
        </div>

        <div className="space-y-6 bg-card p-8 rounded-lg shadow-soft">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Privacy & Consent</h2>
            <p className="text-sm text-muted">
              Your responses are private and encrypted. You can delete your data anytime. This is not
              medical or clinical care.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intention">Why are you here today?</Label>
            <Textarea
              id="intention"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="I want to understand myself better because..."
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label>How much time do you have?</Label>
            <RadioGroup value={timeBudget} onValueChange={setTimeBudget}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="10min" />
                <Label htmlFor="10min">10 minutes (quick start)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="20min" />
                <Label htmlFor="20min">20 minutes (recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="40" id="40min" />
                <Label htmlFor="40min">40 minutes (deep dive)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleStart} disabled={!intention || loading} className="w-full">
            {loading ? "Starting..." : "Begin Journey"}
          </Button>
        </div>
      </div>
    </div>
  );
}