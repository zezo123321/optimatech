import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              TL
            </div>
            <span className="font-display font-bold text-xl">TadreebLink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/login">
              <button className="px-5 py-2 rounded-full font-medium text-sm border border-border hover:bg-muted transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/api/login">
              <button className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                The Future of Corporate Training
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                Empower your team with <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  World-Class Learning
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                A unified platform for creating, managing, and tracking educational experiences. 
                Built for modern organizations that value growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/api/login">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                    Start Learning Now <ArrowRight size={20} />
                  </button>
                </Link>
                <Link href="/api/login">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-border text-foreground font-semibold text-lg hover:bg-muted transition-all flex items-center justify-center">
                    Request Demo
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe2,
                title: "Accessible Anywhere",
                desc: "Cloud-based learning that travels with your team. Mobile-first design ensures seamless access on any device."
              },
              {
                icon: Zap,
                title: "Instant Analytics",
                desc: "Real-time insights into learner progress, course completion rates, and assessment scores."
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Secure",
                desc: "Bank-grade security protocols protect your proprietary content and employee data at all times."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center text-background font-bold text-xs">
              TL
            </div>
            <span className="font-display font-bold">TadreebLink</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 TadreebLink LMS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
