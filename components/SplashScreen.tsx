import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // Animation duration is 4 seconds
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 overflow-hidden"
    >
      <style>{`
        .logo-container {
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 3rem;
          color: #00f3ff;
          text-transform: lowercase;
          font-weight: 900;
          opacity: 0;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          letter-spacing: -0.05em;
        }

        .symbol {
          display: inline-block;
          width: 50px;
          height: 50px;
          border: 3px solid #00f3ff;
          border-radius: 50%;
          position: relative;
          border-style: dashed; 
        }
        
        .symbol::after {
          content: '';
          position: absolute;
          top: 50%;
          left: -40%;
          width: 180%;
          height: 3px;
          background: #00f3ff;
          transform: translateY(-50%);
        }

        .logo-container {
          animation: splashSequence 4s ease-in-out forwards;
        }

        @keyframes splashSequence {
          0% {
            opacity: 0;
            transform: scale(0.8);
            filter: blur(5px);
          }
          10% {
            opacity: 0.5;
            transform: scale(0.8);
            text-shadow: none;
            color: transparent;
            -webkit-text-stroke: 1px #00f3ff; 
          }
          35% {
            opacity: 0.8;
            transform: scale(0.85);
          }
          37% {
            opacity: 1;
            color: #00f3ff;
            -webkit-text-stroke: 0;
            transform: scale(0.85) skewX(10deg);
            text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,0,255,0.5);
          }
          40% {
            transform: scale(0.85) skewX(-5deg);
            text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,0,255,0.5);
          }
          45% {
            transform: scale(0.85) skewX(0deg);
            text-shadow: -5px 0 rgba(255,0,255,0.5), 5px 0 rgba(0,255,255,0.5);
            filter: brightness(1.5);
          }
          55% {
            transform: scale(0.85) skewX(0deg);
            text-shadow: 0 0 10px #00f3ff;
            filter: brightness(1);
          }
          60% {
            transform: scale(0.85);
            opacity: 1;
          }
          75% {
            transform: scale(2.5);
            opacity: 0.8;
            filter: blur(0px);
          }
          90% {
            transform: scale(5);
            opacity: 0;
            filter: blur(10px);
          }
          100% {
            transform: scale(6);
            opacity: 0;
          }
        }
      `}</style>
      <div className="logo-container">
        <div className="symbol"></div>
        <span className="text">mundocancel</span>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
