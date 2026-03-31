'use client';

import { Trophy, Heart, Mail, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="py-8 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            Ready to play, win, and give?
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors group"
          >
            Get Started Free <ArrowUpRight className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                Golf<span className="text-amber-400">Charity</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Play golf. Win prizes. Change lives.
              Every subscription makes a real difference.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-[0.15em] text-slate-500">Platform</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/charities', label: 'Charities' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-[0.15em] text-slate-500">Account</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/sign-in', label: 'Sign In' },
                { href: '/sign-up', label: 'Create Account' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-[0.15em] text-slate-500">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-amber-500" />
                <span>support@golfcharity.app</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Making a difference, one round at a time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Golf Charity Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
