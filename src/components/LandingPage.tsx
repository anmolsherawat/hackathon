import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { gsap } from 'gsap';
import { Pill, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage = ({ onLaunch }: LandingPageProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      heroRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 }
    ).fromTo(
      buttonRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.8'
    ).fromTo(
      splineRef.current,
      { opacity: 0 },
      { opacity: 0.6, duration: 2 },
      '0'
    );
  }, []);

  return (
    <div className="h-screen w-full bg-slate-950 text-white relative overflow-hidden flex items-center justify-center">
      {/* 3D Background */}
      <div 
        ref={splineRef} 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-slate-950/20 z-10" />
        <Spline 
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl">
        <div ref={heroRef} className="space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">MediGuard</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Enterprise <br /> Clinical Intelligence
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            The next-generation graph-powered interaction engine. 
            Real-time, offline-first, and clinical-grade.
          </p>
        </div>

        <button 
          ref={buttonRef}
          onClick={onLaunch}
          className="mt-12 group relative px-12 py-5 bg-white text-slate-950 font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          Launch Platform
          <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Badges */}
        <div className="mt-16 flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-blue-500" />
            Graph-Powered
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Clinical-Grade
          </div>
        </div>
      </div>

      {/* Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />
    </div>
  );
};
