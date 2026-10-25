import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openAuthModal, launchOrion, destinationUrl } = useAuth();

  return (
    <footer className="bg-[#0b101d] text-white/70 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#1d293d] border border-cyan-400/40 flex items-center justify-center text-[#f5f5f5] font-mono text-xs font-bold tracking-tighter">
                Ω9
              </div>
              <span className="text-xl font-bold tracking-wider text-white font-mono uppercase">
                ORION-9
              </span>
            </div>
            <p className="text-base text-white/90 font-medium">
              The Intelligence Layer for Global Supply Chains.
            </p>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              Orion-9 connects supply chain data, operational workflows, risk intelligence, and AI-powered decisions in one unified control tower.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-white/40">
              <ShieldCheck className="w-4 h-4 text-[#f5f5f5]" />
              <span>Target:</span>
              <span className="text-white/70">{destinationUrl}</span>
            </div>
          </div>

          {/* Navigation Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">
              Platform & Architecture
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#platform" className="hover:text-white transition-colors">
                  Platform Overview
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  System Architecture
                </a>
              </li>
              <li>
                <a href="#value" className="hover:text-white transition-colors">
                  Operational Value
                </a>
              </li>
            </ul>
          </div>

          {/* Application Access Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">
              Access Orion-9
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="hover:text-white transition-colors text-left"
                >
                  Log In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="hover:text-white transition-colors text-left"
                >
                  Sign Up
                </button>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={launchOrion}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-xs uppercase tracking-wider hover:bg-[#e5e5e5] transition-all"
                >
                  <span>Launch Orion-9</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Technical Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <p>© {new Date().getFullYear()} Orion-9. All rights reserved.</p>
          <p>BUILT FOR CONNECTED LOGISTICS OPERATIONS</p>
        </div>
      </div>
    </footer>
  );
};
