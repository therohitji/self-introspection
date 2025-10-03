import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Questions() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [notes, setNotes] = useState("");
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

    const loadQuestions = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .order("order_index");
      if (data) setQuestions(data);
    };

    loadQuestions();
  }, [navigate]);

  const saveResponse = async () => {
    if (!sessionId || !user) return;
    setLoading(true);

    try {
      const { data: response, error } = await supabase
        .from("responses")
        .upsert({
          session_id: sessionId,
          question_id: questions[currentIndex].id,
          answer_text: answer,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("events").insert({
        user_id: user.id,
        type: "completed_question",
        metadata: { question_id: questions[currentIndex].id },
      });

      // Trigger background scoring
      await supabase.functions.invoke("score-response", {
        body: { response_id: response.id },
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        setNotes("");
      } else {
        await supabase
          .from("sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        await supabase.functions.invoke("generate-rollup", {
          body: { session_id: sessionId },
        });

        navigate(`/results?session=${sessionId}`);
      }
    } catch (error: any) {
      toast({
        title: "Error saving response",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length) return <div>Loading...</div>;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="bg-card p-8 rounded-lg shadow-soft space-y-6">
          <h2 className="text-2xl font-semibold">{currentQuestion.text}</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Answer</label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Take your time. Be honest with yourself..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Private Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts for yourself..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-4">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(currentIndex - 1)}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            <Button
              onClick={saveResponse}
              disabled={!answer.trim() || loading}
              className="flex-1"
            >
              {loading
                ? "Saving..."
                : currentIndex === questions.length - 1
                  ? "Complete & See Results"
                  : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}