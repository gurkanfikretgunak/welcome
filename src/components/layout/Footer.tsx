'use client'

import { useState, useEffect } from 'react'

type SystemInfoProps = {
  browser: string;
  device: string;
  os: string;
  network: string;
  memory: string;
  performance: string;
  screenResolution: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  
  return (
    <div className="relative mt-8 p-4 text-sm muted border-t border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          © {currentYear} All rights reserved by MasterFabric.
        </div>
        <div 
          onClick={() => setShowSystemInfo(true)} 
          className="cursor-pointer p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center"
          title="View System Information"
        >
          <ComputerIcon />
          <span className="ml-1 text-xs">SYSTEM</span>
        </div>
      </div>
      
      {/* System Info Dialog */}
      {showSystemInfo && (
        <SystemInfoDialog onClose={() => setShowSystemInfo(false)} />
      )}
    </div>
  );
}

function ComputerIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

function SystemInfoDialog({ onClose }: { onClose: () => void }) {
  // Add keyboard event listener to close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Access system info from localStorage (to be set by the page component)
  const [systemInfo, setSystemInfo] = useState<SystemInfoProps>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedInfo = localStorage.getItem('systemInfo');
        return savedInfo ? JSON.parse(savedInfo) : {
          browser: 'Unknown',
          device: 'Unknown',
          os: 'Unknown',
          network: 'Unknown',
          memory: 'Unknown',
          performance: 'Unknown',
          screenResolution: 'Unknown'
        };
      } catch (e) {
        return {
          browser: 'Unknown',
          device: 'Unknown',
          os: 'Unknown',
          network: 'Unknown',
          memory: 'Unknown',
          performance: 'Unknown',
          screenResolution: 'Unknown'
        };
      }
    }
    return {
      browser: 'Unknown',
      device: 'Unknown',
      os: 'Unknown',
      network: 'Unknown',
      memory: 'Unknown',
      performance: 'Unknown',
      screenResolution: 'Unknown'
    };
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="p-6 rounded max-w-md w-full border border-black"
        style={{ 
          backgroundColor: '#ffffff',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          background: '#ffffff'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold tracking-wide">SYSTEM INFORMATION</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>
        
        <div className="border border-black p-4 mb-6" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
          <div className="grid grid-cols-2 gap-y-3 text-left bg-white" style={{ position: 'relative', zIndex: 10 }}>
            <div className="muted text-xs bg-white">BROWSER</div>
            <div className="text-sm bg-white">{systemInfo.browser}</div>
            
            <div className="muted text-xs bg-white">DEVICE</div>
            <div className="text-sm bg-white">{systemInfo.device}</div>
            
            <div className="muted text-xs bg-white">OS</div>
            <div className="text-sm bg-white">{systemInfo.os}</div>
            
            <div className="muted text-xs bg-white">NETWORK</div>
            <div className="text-sm bg-white">{systemInfo.network}</div>
            
            <div className="muted text-xs bg-white">RESOLUTION</div>
            <div className="text-sm bg-white">{systemInfo.screenResolution}</div>
            
            <div className="muted text-xs bg-white">MEMORY</div>
            <div className="text-sm bg-white">{systemInfo.memory}</div>
            
            <div className="muted text-xs bg-white">PERFORMANCE</div>
            <div className="text-sm bg-white">{systemInfo.performance}</div>
          </div>
        </div>
        
        <div className="text-center bg-white">
          <button 
            onClick={onClose}
            className="border border-black px-6 py-2 rounded hover:bg-gray-50 text-sm tracking-wide bg-white"
            style={{ backgroundColor: '#ffffff', position: 'relative' }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
