import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppNav from "@/components/AppNav";

export default function Journal() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else loadTodayEntry(session.user.id);
    });
  }, [navigate]);

  const loadTodayEntry = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (data) {
      setContent(data.content_md || "");
      setLastSaved(new Date(data.updated_at));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("journal_entries").upsert({
        user_id: user.id,
        date: today,
        content_md: content,
      });

      if (error) throw error;

      setLastSaved(new Date());
      toast({
        title: "Journal saved",
        description: "Your entry has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav title="Daily Journal" showBack={true} />
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Journal</h1>
            <p className="text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="text-right">
            {lastSaved && (
              <p className="text-sm text-muted">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-soft">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today?"
            className="min-h-[500px] resize-none text-base"
          />
        </div>
        </div>
      </div>
    </div>
  );
}