import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface RadarChartProps {
  scores: {
    clarity: number;
    specificity: number;
    self_awareness: number;
    growth_mindset: number;
    consistency: number;
  };
}

export function RadarChart({ scores }: RadarChartProps) {
  const data = [
    { dimension: "Clarity", value: scores.clarity },
    { dimension: "Specificity", value: scores.specificity },
    { dimension: "Self-Awareness", value: scores.self_awareness },
    { dimension: "Growth Mindset", value: scores.growth_mindset },
    { dimension: "Consistency", value: scores.consistency },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" />
        <PolarRadiusAxis domain={[0, 5]} />
        <Radar
          name="Your Scores"
          dataKey="value"
          stroke="hsl(var(--accent))"
          fill="hsl(var(--accent))"
          fillOpacity={0.6}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}