import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, List, CheckCircle2, Circle } from "lucide-react";

export default function Questions() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
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

    const loadResponses = async () => {
      if (!sessionId) return;
      const { data } = await supabase
        .from("responses")
        .select("question_id")
        .eq("session_id", sessionId);
      
      if (data) {
        setAnsweredQuestions(new Set(data.map((r) => r.question_id)));
      }
    };

    loadQuestions();
    loadResponses();
  }, [navigate, sessionId]);

  useEffect(() => {
    // Load existing answer when changing questions
    const loadCurrentAnswer = async () => {
      if (!sessionId || !questions[currentIndex]) return;
      
      const { data } = await supabase
        .from("responses")
        .select("*")
        .eq("session_id", sessionId)
        .eq("question_id", questions[currentIndex].id)
        .single();

      if (data) {
        setAnswer(data.answer_text || "");
        setNotes(data.notes || "");
      } else {
        setAnswer("");
        setNotes("");
      }
    };

    loadCurrentAnswer();
  }, [currentIndex, sessionId, questions]);

  const saveResponse = async (skipToNext = true) => {
    if (!sessionId || !user || !answer.trim()) return;
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

      setAnsweredQuestions(new Set([...answeredQuestions, questions[currentIndex].id]));

      await supabase.from("events").insert({
        user_id: user.id,
        type: "completed_question",
        metadata: { question_id: questions[currentIndex].id },
      });

      // Trigger background scoring
      supabase.functions.invoke("score-response", {
        body: { response_id: response.id },
      });

      toast({
        title: "Saved",
        description: "Your answer has been saved.",
      });

      if (skipToNext && currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
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

  const skipQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const finishQuestionnaire = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      await supabase
        .from("sessions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", sessionId);

      supabase.functions.invoke("generate-rollup", {
        body: { session_id: sessionId },
      });

      navigate(`/results?session=${sessionId}`);
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

  if (!questions.length) return <div>Loading...</div>;

  const currentQuestion = questions[currentIndex];
  const answeredCount = answeredQuestions.size;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 border-r bg-card p-6 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <p className="text-sm text-muted mb-2">
              {answeredCount} of {questions.length} answered
            </p>
            <Progress value={progress} />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Questions</h3>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      idx === currentIndex
                        ? "bg-accent text-white"
                        : answeredQuestions.has(q.id)
                          ? "bg-accent/10 hover:bg-accent/20"
                          : "hover:bg-muted"
                    }`}
                  >
                    {answeredQuestions.has(q.id) ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    <span className="line-clamp-2">
                      {idx + 1}. {q.text}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Mobile Navigation Sheet */}
          <div className="lg:hidden flex justify-between items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4 mr-2" />
                  All Questions
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Questions ({answeredCount}/{questions.length})</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                  <div className="space-y-1">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => jumpToQuestion(idx)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          idx === currentIndex
                            ? "bg-accent text-white"
                            : answeredQuestions.has(q.id)
                              ? "bg-accent/10"
                              : "hover:bg-muted"
                        }`}
                      >
                        {answeredQuestions.has(q.id) ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        )}
                        <span className="line-clamp-2">
                          {idx + 1}. {q.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="text-sm text-muted">
              {answeredCount}/{questions.length} done
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Question Card */}
          <div className="bg-card p-8 rounded-lg shadow-soft space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold flex-1">{currentQuestion.text}</h2>
              {answeredQuestions.has(currentQuestion.id) && (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              )}
            </div>

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

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={skipQuestion}
                disabled={currentIndex === questions.length - 1}
              >
                Skip
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

              <Button
                onClick={() => saveResponse(true)}
                disabled={!answer.trim() || loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Save & Continue"}
              </Button>

              {answer.trim() && (
                <Button
                  variant="outline"
                  onClick={() => saveResponse(false)}
                  disabled={loading}
                >
                  Save
                </Button>
              )}
            </div>

            {/* Finish Button */}
            {answeredCount >= 10 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted mb-3">
                  You've answered {answeredCount} questions. You can finish anytime!
                </p>
                <Button onClick={finishQuestionnaire} disabled={loading} variant="secondary">
                  Finish & See Results
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}