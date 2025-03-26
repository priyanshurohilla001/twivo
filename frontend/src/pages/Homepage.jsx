import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Video,
  MessageCircle,
  Users,
  ShieldCheck,
  ChevronRight,
  Loader,
  UserCheck,
  Hash,
  Badge,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Feature Data
const features = [
  {
    title: "Real-Time Chat",
    description: "Instant messaging powered by Twilio Programmable Chat API.",
    icon: MessageCircle,
    ariaLabel: "Instant messaging feature",
  },
  {
    title: "HD Video Calls",
    description: "Seamless video calling using Twilio Programmable Video API.",
    icon: Video,
    ariaLabel: "High definition video calls",
  },
  {
    title: "Bank-Grade Security",
    description: "Secure authentication powered by Firebase/Auth0.",
    icon: ShieldCheck,
    ariaLabel: "Security features",
  },
  {
    title: "Live Presence",
    description: "Real-time user status updates and indicators.",
    icon: Users,
    ariaLabel: "User presence tracking",
  },
];

// Testimonial Data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO at TechCorp",
    text: "Twivo has revolutionized our team communication. The video quality is unmatched and the reliability is exceptional.",
    avatar: "/avatars/sarah.jpg",
  },
  {
    name: "Michael Chen",
    role: "Product Lead",
    text: "The easiest to use video platform we've implemented. Onboarding was seamless and the API docs are fantastic.",
    avatar: "/avatars/michael.jpg",
  },
  {
    name: "Emma Wilson",
    role: "Remote Team Manager",
    text: "Our global team finally feels connected. The presence indicators and chat features are game-changers.",
    avatar: "/avatars/emma.jpg",
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-950/30 to-background dark:from-blue-950/50">
        <div className="container mx-auto px-6 py-28 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Modern Communication <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
                Built for Teams
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Enterprise-grade video conferencing and chat platform with
              <span className="font-semibold text-foreground">
                {" "}
                end-to-end encryption
              </span>{" "}
              and
              <span className="font-semibold text-foreground">
                {" "}
                crystal clear audio
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="px-8 group">
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Live Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Modern Communication
            </h2>
            <p className="text-lg text-muted-foreground">
              Platform features designed for enterprise needs and user
              satisfaction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/20 dark:bg-muted/10 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Integration, Immediate Impact
            </h2>
            <p className="text-muted-foreground">
              Get started in minutes with our developer-friendly SDK and
              comprehensive documentation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={Loader}
              title="1. Implement SDK"
              description="Add our lightweight SDK to your application"
            />
            <StepCard
              icon={UserCheck}
              title="2. Authenticate Users"
              description="Secure authentication with OAuth 2.0 and SAML"
            />
            <StepCard
              icon={Hash}
              title="3. Start Communicating"
              description="Launch real-time features in your platform"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Global Teams
          </h2>
          <p className="text-muted-foreground">
            Join thousands of companies transforming their communication
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-800 dark:to-cyan-800">
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Your Free Trial Today
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              14-day free trial • No credit card required • Cancel anytime
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="lg" className="px-8">
                Get Started
              </Button>
              <Button 
                size="lg" 
                className="px-8 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 dark:hover:text-blue-800 transition-colors"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 dark:bg-muted/10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-4">Twivo</h3>
              <p className="text-muted-foreground">
                Making global communication seamless and secure
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Security</li>
                <li>Integrations</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookie Policy</li>
                <li>GDPR</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-muted/30 text-center text-muted-foreground">
            © {new Date().getFullYear()} Twivo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Feature Card Component
const FeatureCard = ({ title, description, icon: Icon, ariaLabel }) => (
  <div aria-label={ariaLabel} className="h-full">
    <Card className="h-full transition-all hover:border-primary/20 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100/20 dark:bg-blue-950/50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </div>
);

// Reusable Step Card Component
const StepCard = ({ icon: Icon, title, description }) => (
  <div className="bg-background p-8 rounded-xl shadow-sm border dark:border-muted/30 dark:shadow-none">
    <div className="mb-4">
      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({ name, role, text, avatar }) => (
  <div className="bg-background p-8 rounded-xl shadow-sm border dark:border-muted/30 dark:shadow-none">
    <p className="text-muted-foreground mb-6">"{text}"</p>
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={avatar} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>

      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </div>
    </div>
  </div>
);
