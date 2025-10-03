import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadarChart } from "@/components/RadarChart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppNav from "@/components/AppNav";

export default function Results() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [rollup, setRollup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });

    const loadResults = async () => {
      if (!sessionId) return;

      try {
        let { data, error } = await supabase
          .from("rollups")
          .select("*")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        // If no rollup yet, wait a bit and try again (AI might still be processing)
        if (!data) {
          toast({
            title: "Generating insights...",
            description: "This will take just a moment.",
          });

          // Wait 3 seconds and try again
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const retry = await supabase
            .from("rollups")
            .select("*")
            .eq("session_id", sessionId)
            .maybeSingle();

          if (!retry.error) {
            data = retry.data;
          }
        }

        setRollup(data);

        await supabase.from("events").insert({
          type: "viewed_results",
          metadata: { session_id: sessionId },
        });
      } catch (error: any) {
        toast({
          title: "Error loading results",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId, navigate, toast]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="text-lg">Analyzing your insights...</p>
      </div>
    </div>
  );
  
  if (!rollup) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Results generating...</h2>
        <p className="text-muted">
          Your insights are being analyzed. This can take a minute. Try refreshing the page in a moment.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    </div>
  );

  const scores = {
    clarity: rollup.clarity || 0,
    specificity: rollup.specificity || 0,
    self_awareness: rollup.self_awareness || 0,
    growth_mindset: rollup.growth_mindset || 0,
    consistency: rollup.consistency || 0,
  };

  const highlights = rollup.highlights || {};

  return (
    <div className="min-h-screen bg-background">
      <AppNav title="Your Clarity Report" backTo="/" />
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Your Clarity Report</h1>
          <p className="text-muted">Here's what we discovered about your self-awareness</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-soft">
            <h3 className="text-lg font-semibold mb-4">5 Dimensions of Clarity</h3>
            <RadarChart scores={scores} />
          </div>

          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg shadow-soft">
              <h3 className="text-lg font-semibold mb-2">Top Strengths</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {highlights.strengths?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                )) || <li>Analysis pending...</li>}
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft">
              <h3 className="text-lg font-semibold mb-2">Growth Areas</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {highlights.gaps?.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                )) || <li>Analysis pending...</li>}
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-soft">
              <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {highlights.recommendations_week?.map((r: any, i: number) => (
                  <li key={i}>{r.title}</li>
                )) || <li>Recommendations generating...</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/therapist">Start Therapist Mode</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/journal">Open Journal</Link>
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}