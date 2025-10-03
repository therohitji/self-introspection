import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("*, responses!inner(session_id)")
      .eq("responses.session_id", session_id);

    if (scoresError) throw scoresError;

    if (!scores || scores.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scores yet, will try again" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const avgScores = {
      clarity: scores.reduce((sum, s) => sum + (s.clarity || 0), 0) / scores.length,
      specificity: scores.reduce((sum, s) => sum + (s.specificity || 0), 0) / scores.length,
      self_awareness: scores.reduce((sum, s) => sum + (s.self_awareness || 0), 0) / scores.length,
      growth_mindset: scores.reduce((sum, s) => sum + (s.growth_mindset || 0), 0) / scores.length,
      consistency: scores.reduce((sum, s) => sum + (s.consistency || 0), 0) / scores.length,
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Generate insights from introspection scores. Return ONLY valid JSON with strengths, gaps, and recommendations.`,
          },
          {
            role: "user",
            content: `Average scores: ${JSON.stringify(avgScores)}\n\nReturn: {"strengths":["...","..."],"gaps":["...","..."],"contradictions":[],"recommendations_week":[{"title":"...","why":"...","steps":["..."],"success_signal":"..."}],"reflection_prompts":["...","...","..."]}`,
          },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const highlights = JSON.parse(content);

    const { error: rollupError } = await supabase.from("rollups").upsert({
      session_id,
      ...avgScores,
      highlights,
    });

    if (rollupError) throw rollupError;

    return new Response(JSON.stringify({ success: true, highlights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});