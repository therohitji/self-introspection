import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, style = "compassion" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const systemPrompts = {
      compassion: "You are a supportive, non-clinical coach with therapist-like warmth. Validate feelings, reflect, and invite gentle exploration. Keep responses under 180 words. End with one open question.",
      socratic: "You are a thoughtful guide who asks short, insightful questions to increase self-awareness. One question at a time. No clinical advice.",
      "goal-oriented": "You help turn insights into actionable 7-day plans. Be practical and encouraging. No medical advice.",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: systemPrompts[style as keyof typeof systemPrompts] || systemPrompts.compassion,
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const message = data.choices[0].message.content;

    return new Response(JSON.stringify({ message }), {
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