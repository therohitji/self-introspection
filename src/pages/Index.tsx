import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, LineChart, MessageCircle, BookOpen, Heart, Compass, Sparkles, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-calm opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in relative z-10">
          <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-4">
            <span className="text-accent font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered Self-Discovery
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Know Yourself.
            <br />
            <span className="text-muted-foreground">Then Decide.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            50 questions. 5 scores. One clear direction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg px-8 py-6 shadow-medium hover:shadow-large transition-all group" asChild>
              <Link to="/auth">
                Begin Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover-scale">
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50</div>
              <div className="text-sm text-muted-foreground">Deep Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">5</div>
              <div className="text-sm text-muted-foreground">Key Dimensions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">∞</div>
              <div className="text-sm text-muted-foreground">Insights</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            This is not medical care. Your answers stay private.
          </p>
        </div>
      </section>

      {/* Exploration Options */}
      <section className="px-6 py-20 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Multiple Paths to Self-Discovery
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose your journey. Each path is designed to help you understand yourself better.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/auth" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    Full Assessment
                  </h3>
                  <p className="text-muted-foreground">
                    Complete all 50 questions for comprehensive insights into your values, goals, and self-awareness.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    30-45 min
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/journal" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    Daily Journal
                  </h3>
                  <p className="text-muted-foreground">
                    Track your thoughts and emotions daily. Build self-awareness through consistent reflection.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    5-10 min/day
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/therapist" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    AI Therapist
                  </h3>
                  <p className="text-muted-foreground">
                    Have a conversation with our AI therapist. Explore your thoughts in a safe, judgment-free space.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Sparkles className="h-4 w-4 mr-2" />
                    On-demand
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auth" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full border-2 border-accent/20">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                    <Compass className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    Quick Start (10 Q's)
                  </h3>
                  <p className="text-muted-foreground">
                    Short on time? Get started with 10 essential questions and receive preliminary insights.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    10-15 min
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auth" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    Values Explorer
                  </h3>
                  <p className="text-muted-foreground">
                    Discover what truly matters to you. Identify your core values and align your life accordingly.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Target className="h-4 w-4 mr-2" />
                    Focused
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auth" className="block">
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    Progress Tracker
                  </h3>
                  <p className="text-muted-foreground">
                    Return monthly to track your growth. See how your clarity and self-awareness evolve over time.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    Ongoing
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
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
      <section className="px-6 py-20 bg-gradient-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <Sparkles className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to see yourself clearly?
          </h2>
          <p className="text-xl text-white/90">
            Join thousands on their journey to self-awareness. Your future self will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-large hover:shadow-xl transition-all group" asChild>
              <Link to="/auth">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30">
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to AI Therapist
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
