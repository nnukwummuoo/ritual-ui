"use client";

import Image from 'next/image';

export default function AnyaPage() {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center p-8" style={{backgroundColor: '#0f1419'}}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Anya Image */}
        <div className="mb-8">
          <Image 
            src="/Anya.png" 
            alt="Anya" 
            width={120}
            height={120}
            className="mx-auto rounded-full shadow-2xl"
          />
        </div>

        {/* Vision Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold" style={{color: '#bec8fa'}}>
            🌍 Our Vision
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed" style={{color: '#bec8fa'}}>
            We believe in a world where creators keep 100% of what they earn, without middlemen, cuts, or control.
          </p>
          
          <p className="text-lg md:text-xl leading-relaxed" style={{color: '#bec8fa'}}>
            A world where people connect directly, on their own terms — without pressure, algorithms, or endless streaming.
          </p>

          <div className="rounded-2xl p-8" style={{backgroundColor: '#191e37', borderColor: '#bec8fa', border: '1px solid'}}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{color: '#bec8fa'}}>
              💡 Our platform is built for independence:
            </h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💰</span>
                <p className="text-lg" style={{color: '#bec8fa'}}>
                  <strong style={{color: '#bec8fa'}}>Your earnings are yours</strong> — forever.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <p className="text-lg" style={{color: '#bec8fa'}}>
                  <strong style={{color: '#bec8fa'}}>Your choices are yours</strong> — Fan Call, Fan Meet, or Fan Date.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🕊️</span>
                <p className="text-lg" style={{color: '#bec8fa'}}>
                  <strong style={{color: '#bec8fa'}}>Your freedom is yours</strong> — no subscriptions, no forced lives, no hidden cuts.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl md:text-2xl font-semibold" style={{color: '#bec8fa'}}>
              This isn't just an app.
            </p>
            
            <p className="text-xl md:text-2xl font-semibold" style={{color: '#bec8fa'}}>
              It's a quiet revolution — giving power back to the people who create, share, and connect.
            </p>
          </div>

          <div className="text-2xl md:text-3xl font-bold" style={{color: '#bec8fa'}}>
            ✨ Real connections. Real freedom. Real earnings.
          </div>
        </div>
      </div>
    </section>
  );
}