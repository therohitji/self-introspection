import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, LineChart, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Self-Reflect</h1>
          <Button variant="outline" onClick={() => navigate('/therapist')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Talk to Therapist
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 md:pt-32 md:pb-40 mt-16">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Know Yourself.
            <br />
            <span className="text-muted-foreground">Then Decide.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            50 questions. 5 scores. One clear direction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg px-8 py-6 shadow-medium hover:shadow-large transition-all" asChild>
              <Link to="/auth">
                Begin now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              See a sample report
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            This is not medical care. Your answers stay private.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-gradient-calm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-soft hover:shadow-medium transition-all animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Answer honestly</h3>
              <p className="text-muted-foreground leading-relaxed">
                50 thoughtful questions about your values, goals, and self-perception. It's completely private.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-soft hover:shadow-medium transition-all animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <LineChart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI scores clarity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get scored across 5 dimensions: clarity, specificity, self-awareness, growth mindset, and consistency.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-soft hover:shadow-medium transition-all animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get insights & guidance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive a detailed dashboard with strengths, gaps, and gentle nudges toward your best self.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built on Trust
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">100%</div>
              <p className="text-muted-foreground">Your data. You own it.</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">Private</div>
              <p className="text-muted-foreground">Delete anytime, no questions.</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">Safe</div>
              <p className="text-muted-foreground">Not a substitute for therapy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to see yourself clearly?
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Start your journey to self-awareness.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6 mt-6" asChild>
            <Link to="/auth">
              Begin your introspection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
