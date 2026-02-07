import { Link } from "wouter";
import { ArrowRight, Globe2, ShieldCheck, Zap, BarChart3, Users, Check } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { RequestDemoDialog } from "@/components/landing/RequestDemoDialog";
import { useRef } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleOnHover = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 300 } }
};

export default function Landing() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden selection:bg-primary/30">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src="/assets/logo.png" alt="Optimatech" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-xl tracking-tight">Optimatech</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="hidden sm:block px-5 py-2 rounded-full font-medium text-sm border border-border hover:bg-muted transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none z-0" />

        {/* Floating Orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[90px] pointer-events-none"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-primary/20 shadow-sm mb-8">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-primary uppercase tracking-wide">
                  Reimagining Enterprise Learning
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground mb-8 leading-[1.1]"
              >
                Unlock Your Team's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-cyan-400 animate-gradient-x bg-[length:200%_auto]">
                  Full Potential
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light"
              >
                The enterprise LMS that combines powerful course management with a delightful, AI-driven learner experience.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">Start Free Trial</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <div className="scale-100 hover:scale-105 transition-transform">
                  <RequestDemoDialog />
                </div>
              </motion.div>

              {/* Stats / Social Proof */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-20 pt-10 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {[
                  { label: "Active Learners", value: "50k+" },
                  { label: "Courses Created", value: "1.2k+" },
                  { label: "Completion Rate", value: "94%" },
                  { label: "Enterprise Customers", value: "200+" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="flex flex-col items-center group cursor-default"
                  >
                    <span className="text-4xl font-bold text-foreground font-display group-hover:text-primary transition-colors duration-300">{stat.value}</span>
                    <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid with Scroll Animation */}
      <section className="py-32 bg-secondary/30 relative">
        {/* Parallax Background Shape */}
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="container mx-auto px-4 relative z-10" ref={targetRef}>
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-display mb-4"
            >
              Why Optimatech?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              We've re-engineered the learning experience from the ground up.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe2,
                title: "Accessible Anywhere",
                desc: "Cloud-based learning that travels with your team. Mobile-first design ensures seamless access on any device.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: BarChart3,
                title: "Instant Analytics",
                desc: "Real-time insights into learner progress, course completion rates, and assessment scores.",
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Secure",
                desc: "Bank-grade security protocols protect your proprietary content and employee data at all times.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Zap,
                title: "AI-Driven Paths",
                desc: "Smart algorithms suggest the next best course for each employee based on their role and skills gap.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Users,
                title: "Collaborative Learning",
                desc: "Foster team growth with discussion boards, peer reviews, and group projects integrated natively.",
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              },
              {
                icon: Check,
                title: "Compliance Ready",
                desc: "Automated certification and recertification tracking ensures your organization never misses a deadline.",
                color: "text-cyan-500",
                bg: "bg-cyan-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-display mb-6">Ready to transform your team?</h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">Join 200+ enterprise organizations delivering world-class training with Optimatech.</p>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-full bg-white text-primary font-bold text-xl shadow-2xl hover:bg-gray-50 transition-colors"
              >
                Get Started Now
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-90">
            <img src="/assets/logo.png" alt="Optimatech" className="w-10 h-10 object-contain" />
            <span className="font-display font-bold text-xl">Optimatech</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Optimatech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
