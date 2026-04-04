import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Eye, Upload, Cpu, BarChart3, ArrowRight, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-scan.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Eye, title: "Plate Detection", desc: "Deep learning-powered detection with 99.2% accuracy" },
  { icon: Zap, title: "Real-time Processing", desc: "Results in under 2 seconds with GPU acceleration" },
  { icon: BarChart3, title: "Owner Retrieval", desc: "Instant vehicle owner details via integrated API" },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encryption for all processed data" },
];

const steps = [
  { num: "01", icon: Upload, title: "Upload Image", desc: "Drag & drop or browse to upload a vehicle image" },
  { num: "02", icon: Cpu, title: "AI Processing", desc: "Our deep learning model detects and extracts the plate" },
  { num: "03", icon: ScanLine, title: "Get Results", desc: "View plate number, confidence score, and owner details" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">PlateVision</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
            <Button size="sm" onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "hsl(239 84% 67% / 0.3)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "hsl(199 89% 60% / 0.2)" }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center max-w-3xl mx-auto" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass-card px-4 py-1.5 mb-6 text-xs font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Powered by Deep Learning
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              <span className="text-foreground">AI-Powered</span>
              <br />
              <span className="gradient-text">Vehicle Intelligence</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Upload. Detect. Identify. Instantly. The most advanced number plate recognition system built for speed and accuracy.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex items-center justify-center gap-4">
              <Button size="xl" onClick={() => navigate("/dashboard")}>
                Try Now <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/login")}>
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-16 max-w-4xl mx-auto">
            <div className="glass-card p-2 glow-border">
              <div className="relative rounded-xl overflow-hidden">
                <img src={heroImage} alt="AI scanning vehicle number plate" className="w-full rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass-card p-4 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Detection Complete — Plate: MH 12 AB 1234</span>
                  <span className="ml-auto text-xs text-success font-medium">99.7% confidence</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Built for Precision</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Advanced capabilities that make PlateVision the most reliable recognition system available.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Three simple steps to identify any vehicle</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
                <span className="text-6xl font-black text-primary/10">{s.num}</span>
                <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto -mt-6 mb-4">
                  <s.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-card p-12 glow-border">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">Experience the power of AI-driven vehicle recognition today.</p>
            <Button size="xl" onClick={() => navigate("/dashboard")}>
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-btn flex items-center justify-center">
              <ScanLine className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">PlateVision</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 PlateVision. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
