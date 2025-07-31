import React from 'react';

const DemoModeIndicator: React.FC = () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎮</span>
        <span className="font-bold text-sm">
          MODO DEMO ACTIVADO
        </span>
      </div>
      <div className="text-xs opacity-75">
        Los pagos son simulados
      </div>
    </div>
  );
};

export default DemoModeIndicator;
