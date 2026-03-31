'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Trophy, Heart, Target, Users, ArrowRight, Star,
  TrendingUp, Gift, Shield, Sparkles, ChevronRight,
  Zap, Globe, Award, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { useEffect, useState, useRef } from 'react';

// Animated counter hook
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HomePage() {
  const [charities, setCharities] = useState<any[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stat1 = useCounter(5000, 2000);
  const stat2 = useCounter(500, 1800);
  const stat3 = useCounter(50, 1500);
  const stat4 = useCounter(5, 1000);

  useEffect(() => {
    fetch('/api/charities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCharities(data.filter((c: any) => c.is_featured).slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-slate-50" />
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] rounded-full bg-amber-200/20 blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-rose-200/20 blur-[80px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-100/15 blur-[100px] animate-float-slow" />
        </motion.div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <motion.div style={{ opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-700 rounded-full px-5 py-2 text-sm font-medium mb-8 shadow-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Monthly Draw Live — £5,000+ Prize Pool
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 leading-[0.95]"
            >
              Your Scores.
              <br />
              <span className="text-gradient">Their Future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              Subscribe, enter your golf scores, and compete in monthly prize draws.
              A portion of every subscription goes directly to the charity
              <span className="text-slate-700 font-medium"> you</span> choose.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-10 shadow-xl shadow-amber-500/20">
                  <Heart className="h-5 w-5 mr-2" />
                  Start Giving Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="text-base group">
                  See How It Works
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Draw Balls Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 flex items-center justify-center gap-4"
            >
              {[12, 27, 34, 8, 41].map((num, i) => (
                <motion.div
                  key={num}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="draw-ball cursor-pointer"
                >
                  {num}
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-4 text-sm text-slate-400"
            >
              Last month's winning numbers — could yours be next?
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-slate-300 flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TRUST TICKER ===== */}
      <section className="py-6 bg-slate-900 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-12 px-6">
              {[
                '30% of subscriptions go to prize pool',
                '10%+ goes to your chosen charity',
                'Monthly draws with £5,000+ prizes',
                'Verified charity partners',
                'Secure Stripe payments',
                'Open & transparent draw system',
                '500+ active members',
              ].map((text) => (
                <span key={text + idx} className="flex items-center gap-3 text-sm text-slate-300">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Zap className="h-4 w-4" /> Dead Simple
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Three steps. That's it.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              No complexity. No forms to fill. Just play, enter, and win.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Target,
                step: '01',
                title: 'Enter Your Scores',
                description: 'Submit your latest 5 Stableford scores (1-45). New scores automatically replace the oldest.',
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-50',
              },
              {
                icon: Trophy,
                step: '02',
                title: 'Win Monthly Prizes',
                description: 'Our draw engine matches your scores against 5 drawn numbers. Match 3, 4, or 5 to win.',
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50',
              },
              {
                icon: Heart,
                step: '03',
                title: 'Support a Charity',
                description: 'At least 10% of your subscription goes directly to the verified charity you choose.',
                gradient: 'from-rose-500 to-pink-500',
                bg: 'bg-rose-50',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-2 w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                    {item.step}
                  </div>

                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>

                  {/* Bottom accent */}
                  <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-full bg-linear-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { ref: stat1.ref, count: stat1.count, prefix: '£', suffix: '+', label: 'In Monthly Prizes', icon: Trophy, color: 'text-amber-500' },
              { ref: stat2.ref, count: stat2.count, prefix: '', suffix: '+', label: 'Active Members', icon: Users, color: 'text-blue-500' },
              { ref: stat3.ref, count: stat3.count, prefix: '£', suffix: 'K+', label: 'Donated to Charity', icon: Heart, color: 'text-rose-500' },
              { ref: stat4.ref, count: stat4.count, prefix: '', suffix: '', label: 'Verified Charities', icon: Shield, color: 'text-emerald-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                ref={stat.ref}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 text-center shadow-sm"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tabular-nums">
                  {stat.prefix}{stat.count.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CHARITY IMPACT ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Real Impact, Real Lives
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Every subscription
                <br />
                <span className="text-gradient">changes a life.</span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                This isn't just about golf. It's about community, generosity, and
                the power of small contributions adding up to massive change.
              </p>
              <p className="mt-4 text-lg text-slate-500 leading-relaxed">
                Choose from our vetted charity partners and watch your impact grow
                every single month.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { icon: Users, label: 'Lives Impacted', value: '2,000+' },
                  { icon: TrendingUp, label: 'Donated So Far', value: '£50K+' },
                  { icon: Gift, label: 'Charities Supported', value: '5' },
                  { icon: Globe, label: 'Community Reach', value: 'UK-wide' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <stat.icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/charities" className="inline-flex items-center gap-2 mt-10 text-amber-500 font-semibold hover:text-amber-600 transition-colors group">
                Explore Our Charities <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              {(charities.length > 0 ? charities : [
                { name: 'Golf for Good Foundation', description: 'Empowering underprivileged youth through golf programs.' },
                { name: 'Green Hearts Initiative', description: 'Promoting mental health through outdoor sports.' },
                { name: 'Fairway Future Trust', description: 'Building sustainable communities through green spaces.' },
              ]).map((charity, i) => (
                <motion.div
                  key={charity.name}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ x: 8 }}
                  className="flex items-center gap-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{charity.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{charity.description}</p>
                  </div>
                  <Star className="h-5 w-5 text-amber-400 shrink-0" />
                </motion.div>
              ))}

              {/* Extra info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-amber-50 rounded-2xl p-5 border border-amber-100"
              >
                <p className="text-sm text-amber-800 font-medium">
                  <Award className="h-4 w-4 inline mr-2 text-amber-600" />
                  All charities are verified and audited. Your contribution is tracked and transparent.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== PRIZE POOL ===== */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-amber-500/20">
              <BarChart3 className="h-4 w-4" /> Prize Distribution
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              The Prize Pool
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              30% of every subscription goes straight into the monthly prize pool. Here's how it's split.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', label: 'JACKPOT', gradient: 'from-amber-400 to-amber-600', rollover: true, shadow: 'shadow-amber-500/20' },
              { match: '4-Number Match', share: '35%', label: 'SECOND TIER', gradient: 'from-slate-300 to-slate-500', rollover: false, shadow: 'shadow-slate-500/10' },
              { match: '3-Number Match', share: '25%', label: 'THIRD TIER', gradient: 'from-amber-600 to-amber-800', rollover: false, shadow: 'shadow-amber-700/10' },
            ].map((tier, i) => (
              <motion.div
                key={tier.match}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className={`shine-effect glass-dark rounded-3xl p-8 text-center ${i === 0 ? 'ring-2 ring-amber-500/30 animate-pulse-glow' : ''}`}
              >
                <div className="text-xs font-bold tracking-[0.2em] text-amber-400 mb-4">{tier.label}</div>
                <div className={`text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r ${tier.gradient}`}>
                  {tier.share}
                </div>
                <div className="text-lg font-semibold text-white mt-4">{tier.match}</div>
                {tier.rollover && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber-400/90 bg-amber-500/10 rounded-full px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5" /> Rolls over if unclaimed!
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-slate-500 text-sm"
          >
            Prizes are split equally among multiple winners in the same tier. Jackpot carries forward if no 5-number winner.
          </motion.p>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              What Members Say
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Join hundreds of golfers who are winning prizes and changing lives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'James W.',
                role: '4-Number Winner',
                quote: 'Won £420 in my third month and my charity contribution just crossed £100. Never thought my golf scores could do this much good.',
                avatar: 'JW',
                color: 'from-blue-500 to-blue-600',
              },
              {
                name: 'Sarah M.',
                role: 'Monthly Subscriber',
                quote: 'The draw system is brilliant — it gives my Saturday round an extra edge. Plus knowing a portion goes to Veterans on the Green makes it feel meaningful.',
                avatar: 'SM',
                color: 'from-rose-500 to-rose-600',
              },
              {
                name: 'David K.',
                role: '3-Number Winner',
                quote: 'Signed up on a whim, matched 3 numbers first month. The verification was quick and payout came within a week. Proper platform.',
                avatar: 'DK',
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-amber-500 font-medium">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-100/30 rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Ready to make
              <br />
              a <span className="text-gradient">difference</span>?
            </h2>
            <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto">
              Join hundreds of golfers who are winning prizes and changing lives.
              Starting from just £9.99/month.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pricing">
                <Button size="lg" className="text-base px-12 shadow-xl shadow-amber-500/20">
                  View Plans & Subscribe
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              No lock-in. Cancel anytime. 100% of charity contributions guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
