import React from 'react';

export const MouxLoader = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] overflow-hidden select-none">
      <div className="relative flex items-center justify-center w-full">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-[60vw] h-auto overflow-visible">
          <rect width="100" height="100" fill="black"/>
          <text x="50" y="75" fontFamily="'Brush Script MT', cursive" fontSize="80" fill="white" textAnchor="middle">
            m
          </text>
        </svg>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-white font-sans font-black text-[16px] tracking-widest">
          MOUX V1.1.0
        </p>
      </div>
    </div>
  );
};

