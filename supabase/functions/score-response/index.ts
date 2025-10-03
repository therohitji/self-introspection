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
    const { response_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: response, error: responseError } = await supabase
      .from("responses")
      .select("*, questions(*)")
      .eq("id", response_id)
      .single();

    if (responseError) throw responseError;

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
            content: `You are an analytical coach evaluating introspection quality. Score this answer on 5 dimensions (1-5): clarity, specificity, self_awareness, growth_mindset, consistency. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `QUESTION: ${response.questions.text}\nANSWER: ${response.answer_text}\n\nReturn JSON: {"scores":{"clarity":n,"specificity":n,"self_awareness":n,"growth_mindset":n,"consistency":n},"why":{"clarity":"...","specificity":"...","self_awareness":"...","growth_mindset":"...","consistency":"..."},"tags":[],"contradictions":[],"red_flags":[]}`,
          },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(content);

    const { error: scoreError } = await supabase.from("scores").upsert({
      response_id,
      clarity: result.scores.clarity,
      specificity: result.scores.specificity,
      self_awareness: result.scores.self_awareness,
      growth_mindset: result.scores.growth_mindset,
      consistency: result.scores.consistency,
      tags: result.tags || [],
      contradictions: result.contradictions || [],
      red_flags: result.red_flags || [],
      why_json: result.why,
    });

    if (scoreError) throw scoreError;

    return new Response(JSON.stringify({ success: true }), {
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