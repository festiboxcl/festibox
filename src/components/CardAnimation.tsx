import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export function CardAnimation() {
  const { playClick, playTap, playSuccess } = useSound();
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 5 pasos mejorados de la animación: 0-100
  const maxStep = 100;
  const steps = [
    { min: 0, max: 25, description: "Tarjeta cerrada con lengüeta central y líneas amarillas" },
    { min: 25, max: 50, description: "Tirando lengüeta hacia abajo, sobre se abre hacia abajo" },
    { min: 50, max: 70, description: "Cubos aplastados emergen del interior abierto" },
    { min: 70, max: 90, description: "Cubos se expanden a forma 3D y se separan" },
    { min: 90, max: 100, description: "¡Explosión final con confeti colorido!" }
  ];

  const getCurrentStep = () => {
    return steps.findIndex(step => animationStep >= step.min && animationStep <= step.max);
  };

  const handleSliderChange = (value: number) => {
    setAnimationStep(value);
    playTap();
  };

  const playAnimation = () => {
    setIsPlaying(true);
    playClick();
    
    // Animación automática más fluida
    let currentValue = 0;
    const interval = setInterval(() => {
      currentValue += 1.2; // Más lenta para mayor fluidez
      setAnimationStep(currentValue);
      
      if (currentValue >= maxStep) {
        clearInterval(interval);
        setIsPlaying(false);
        playSuccess();
      }
    }, 60); // Intervalo más frecuente para suavidad
  };

  const resetAnimation = () => {
    setAnimationStep(0);
    setIsPlaying(false);
    playClick();
  };

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Play className="w-6 h-6 text-primary-600" />
          ¿Cómo funciona una tarjeta explosiva?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mueve el slider o reproduce la animación para ver cómo se abre tu tarjeta explosiva paso a paso.
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={playAnimation}
          disabled={isPlaying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isPlaying 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 hover:scale-105 shadow-md hover:shadow-lg'
          }`}
        >
          <Play className="w-4 h-4" />
          {isPlaying ? 'Reproduciendo...' : 'Ver animación'}
        </button>
        
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      {/* Slider de control */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="range"
            min="0"
            max={maxStep}
            value={animationStep}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            disabled={isPlaying}
            className="w-full h-3 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, rgb(222 90 22) 0%, rgb(222 90 22) ${animationStep}%, rgb(226 232 240) ${animationStep}%, rgb(226 232 240) 100%)`
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Cerrado</span>
            <span>Abierto</span>
          </div>
        </div>
        
        {/* Descripción del paso actual */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
            <span className="font-medium text-gray-800">
              {steps[getCurrentStep()]?.description || "Sobre cerrado"}
            </span>
          </div>
        </div>
      </div>

      {/* Área de animación 3D - más alta para sobre vertical */}
      <div className="relative h-96 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl overflow-hidden">
        <CardAnimationScene step={animationStep} />
      </div>

      {/* Mensaje explicativo */}
      <div className="text-center mt-6 p-4 bg-white/70 rounded-xl border border-white/50">
        <p className="text-gray-700 font-medium">
          🎁 <strong>¡Crea tu propia tarjeta explosiva!</strong> Cada cubo puede contener tus fotos y mensajes más especiales.
        </p>
      </div>
    </section>
  );
}

// Componente de la escena 3D animada - Tarjeta que se abre hacia abajo
function CardAnimationScene({ step }: { step: number }) {
  // Calcular transformaciones basadas en tirar la lengüeta hacia abajo
  const tabPullDown = Math.min(step * 4, 200); // Lengüeta se tira hacia abajo más
  const envelopeOpenDown = Math.max(0, (step - 25) * 6); // Sobre se abre hacia abajo después
  const cubesTranslateY = Math.max(0, (step - 50) * 5); // Cubos salen cuando está abierto
  const cubesHeight = Math.min(1, Math.max(0.15, (step - 35) / 40)); // Altura de aplastado a cubo
  const cubesSpread = Math.max(0, (step - 70) * 2.5); // Se separan al final
  const cubesRotation = step > 80 ? (step - 80) * 8 : 0; // Rotación final

  return (
    <div style={{ perspective: '1000px' }} className="relative w-full h-full flex items-center justify-center">
      
      {/* Tarjeta vertical cerrada - solo blanco/gris sin colores */}
      <div className="absolute" style={{ transform: 'translateZ(0px)' }}>
        
        {/* Base de la tarjeta - parte superior que se mantiene fija */}
        <div className="relative w-24 h-80 bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden">
          {/* Líneas de prepicado amarillas en los lados */}
          <div className="absolute top-16 left-0 w-1 h-12 border-l-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-32 left-0 w-1 h-12 border-l-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-48 left-0 w-1 h-12 border-l-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-64 left-0 w-1 h-12 border-l-2 border-dashed border-yellow-400 opacity-80"></div>
          
          <div className="absolute top-16 right-0 w-1 h-12 border-r-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-32 right-0 w-1 h-12 border-r-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-48 right-0 w-1 h-12 border-r-2 border-dashed border-yellow-400 opacity-80"></div>
          <div className="absolute top-64 right-0 w-1 h-12 border-r-2 border-dashed border-yellow-400 opacity-80"></div>
          
          {/* Línea de prepicado horizontal donde se abre */}
          <div className="absolute top-60 left-1 right-1 h-1 border-t-2 border-dashed border-yellow-400 opacity-80"></div>
          
          {/* Logo FestiBox en el centro */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-blue-500 text-white px-3 py-2 rounded transform -rotate-3 shadow-lg">
              <div className="font-bold text-sm">FESTIBOX</div>
              <div className="text-xs opacity-90">🎁</div>
            </div>
          </div>
        </div>
        
        {/* Lengüeta central con flechas negras (la que se tira hacia abajo) */}
        <div 
          className="absolute bg-white border-2 border-gray-400 rounded-b-lg shadow-lg transition-all duration-700 ease-out z-30"
          style={{
            width: '20px',
            height: '50px',
            left: '50%',
            top: `${320 + tabPullDown}px`,
            transform: 'translateX(-50%)',
            transformOrigin: 'top center'
          }}
        >
          {/* Múltiples flechas negras hacia abajo como en tu dibujo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
        
        {/* Parte inferior del sobre que se abre hacia abajo */}
        <div 
          className="absolute w-24 bg-white rounded-b-lg shadow-lg border-2 border-gray-300 transition-all duration-700 ease-out overflow-hidden"
          style={{
            height: '240px', // Parte inferior del sobre
            top: `${160 + envelopeOpenDown}px`, // Se mueve hacia abajo
            left: '0px',
            transformOrigin: 'top center',
            transform: `rotateX(${Math.min(envelopeOpenDown / 10, 45)}deg)`, // Se inclina ligeramente
            zIndex: step > 40 ? 5 : 15
          }}
        >
          {/* Interior del sobre visible cuando se abre */}
          <div className="absolute inset-2 bg-gray-50 rounded opacity-60"></div>
          
          {/* Líneas de prepicado que se están rompiendo */}
          {step > 25 && (
            <>
              <div className="absolute top-0 left-0 w-1 h-8 border-l-3 border-dashed border-yellow-400 opacity-60"></div>
              <div className="absolute top-0 right-0 w-1 h-8 border-r-3 border-dashed border-yellow-400 opacity-60"></div>
            </>
          )}
        </div>
      </div>
        
        {/* Base de la tarjeta - fondo con patrón geométrico */}
        <div className="relative w-24 h-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
          {/* Patrón geométrico de fondo similar a la imagen */}
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(45deg, #f59e0b 25%, transparent 25%),
              linear-gradient(-45deg, #f59e0b 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ec4899 75%),
              linear-gradient(-45deg, transparent 75%, #ec4899 75%),
              linear-gradient(45deg, #06b6d4 25%, transparent 25%),
              linear-gradient(-45deg, #06b6d4 25%, transparent 25%),
              #f3f4f6
            `,
            backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0, 0 0, 10px 10px',
            opacity: 0.6
          }}>
          </div>
          
          {/* Triángulos y formas geométricas adicionales */}
          <div className="absolute top-8 left-2 w-8 h-8 bg-purple-400 transform rotate-45 opacity-70"></div>
          <div className="absolute top-20 right-2 w-6 h-6 bg-yellow-400 rounded-full opacity-70"></div>
          <div className="absolute top-32 left-3 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-blue-400 opacity-70"></div>
          <div className="absolute top-48 right-1 w-10 h-4 bg-pink-400 transform -rotate-12 opacity-70"></div>
          <div className="absolute bottom-20 left-2 w-6 h-6 bg-green-400 transform rotate-12 opacity-70"></div>
          
          {/* Logo FestiBox en el centro como en la imagen */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-blue-500 text-white px-3 py-2 rounded transform -rotate-3 shadow-lg">
              <div className="font-bold text-sm">FESTIBOX</div>
              <div className="text-xs opacity-90">🎁</div>
            </div>
          </div>

          {/* Líneas de prepicado en los lados */}
          <div className="absolute top-12 left-0 w-1 h-16 border-l-2 border-dashed border-gray-400 opacity-60"></div>
          <div className="absolute top-32 left-0 w-1 h-16 border-l-2 border-dashed border-gray-400 opacity-60"></div>
          <div className="absolute top-52 left-0 w-1 h-16 border-l-2 border-dashed border-gray-400 opacity-60"></div>
          
          <div className="absolute top-12 right-0 w-1 h-16 border-r-2 border-dashed border-gray-400 opacity-60"></div>
          <div className="absolute top-32 right-0 w-1 h-16 border-r-2 border-dashed border-gray-400 opacity-60"></div>
          <div className="absolute top-52 right-0 w-1 h-16 border-r-2 border-dashed border-gray-400 opacity-60"></div>
        </div>
        
        {/* Lengüeta central con flecha negra (la que se tira) */}
        <div 
          className="absolute bg-white border-2 border-gray-300 rounded-b-lg shadow-lg transition-all duration-500 ease-out z-30"
          style={{
            width: '16px',
            height: '40px',
            left: '50%',
            top: `${320 + tabPullDown}px`,
            transform: 'translateX(-50%)',
            transformOrigin: 'top center'
          }}
        >
          {/* Flecha negra hacia abajo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
              <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-black -mt-1"></div>
              <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-black -mt-1"></div>
            </div>
          </div>
        </div>
        
        {/* Parte inferior del sobre que se abre hacia abajo */}
        <div 
          className="absolute w-24 bg-white rounded-b-lg shadow-lg border-2 border-gray-300 transition-all duration-700 ease-out overflow-hidden"
          style={{
            height: '240px', // Parte inferior del sobre
            top: `${160 + envelopeOpenDown}px`, // Se mueve hacia abajo
            left: '0px',
            transformOrigin: 'top center',
            transform: `rotateX(${Math.min(envelopeOpenDown / 10, 45)}deg)`, // Se inclina ligeramente
            zIndex: step > 40 ? 5 : 15
          }}
        >
          {/* Interior del sobre visible cuando se abre */}
          <div className="absolute inset-2 bg-gray-50 rounded opacity-60"></div>
          
          {/* Líneas de prepicado que se están rompiendo */}
          {step > 25 && (
            <>
              <div className="absolute top-0 left-0 w-1 h-8 border-l-3 border-dashed border-yellow-400 opacity-60"></div>
              <div className="absolute top-0 right-0 w-1 h-8 border-r-3 border-dashed border-yellow-400 opacity-60"></div>
            </>
          )}
        </div>
      </div>

      {/* Cubos emergiendo desde el interior */}
      <div 
        className="absolute transition-all duration-500 ease-out"
        style={{
          transform: `translateY(${-cubesTranslateY}px)`,
          opacity: step > 45 ? 1 : 0,
          bottom: '15%'
        }}
      >
        {/* Cubo 1 - Izquierda */}
        <div 
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform: `translateX(${-cubesSpread - 25}px) translateY(${step < 60 ? '30px' : '0px'})`,
            left: '-30px'
          }}
        >
          <CubeComponent 
            size={50}
            height={50 * cubesHeight}
            color="from-primary-400 to-primary-600"
            faces={['📸', '💕', '🎉', '✨']}
            rotation={cubesRotation + 15}
            isFlattened={step < 65}
          />
        </div>

        {/* Cubo 2 - Centro */}
        <div 
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform: `translateX(0px) translateY(${step < 60 ? '25px' : '0px'})`,
            left: '-25px'
          }}
        >
          <CubeComponent 
            size={50}
            height={50 * cubesHeight}
            color="from-secondary-400 to-secondary-600"
            faces={['🌟', '❤️', '🎁', '🥰']}
            rotation={cubesRotation - 5}
            isFlattened={step < 65}
          />
        </div>

        {/* Cubo 3 - Derecha */}
        <div 
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform: `translateX(${cubesSpread + 25}px) translateY(${step < 60 ? '35px' : '0px'})`,
            left: '-20px'
          }}
        >
          <CubeComponent 
            size={50}
            height={50 * cubesHeight}
            color="from-accent-400 to-accent-600"
            faces={['🌈', '💝', '🎈', '⭐']}
            rotation={cubesRotation - 25}
            isFlattened={step < 65}
          />
        </div>
      </div>

      {/* Explosión de confeti mejorada */}
      {step > 90 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full animate-bounce ${
                i % 5 === 0 ? 'bg-yellow-400' :
                i % 5 === 1 ? 'bg-pink-400' :
                i % 5 === 2 ? 'bg-blue-400' : 
                i % 5 === 3 ? 'bg-green-400' : 'bg-purple-400'
              }`}
              style={{
                left: `${10 + i * 5}%`,
                top: `${15 + (i % 5) * 15}%`,
                animationDelay: `${i * 0.06}s`,
                animationDuration: '0.9s',
                transform: `scale(${0.4 + (i % 4) * 0.3})`
              }}
            />
          ))}
          
          {/* Estrellas de celebración */}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-400 animate-pulse"
              style={{
                left: `${20 + i * 8}%`,
                top: `${5 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.12}s`,
                fontSize: `${10 + (i % 4) * 3}px`
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de cubo 3D con capacidad de aplanamiento vertical
function CubeComponent({ 
  size, 
  height,
  color, 
  faces, 
  rotation,
  isFlattened = false
}: { 
  size: number;
  height?: number;
  color: string; 
  faces: string[]; 
  rotation: number;
  isFlattened?: boolean;
}) {
  const cubeHeight = height || size;
  const actualSize = size;

  return (
    <div 
      style={{ perspective: '400px' }}
      className="transition-all duration-700 ease-out"
    >
      <div
        className="relative transition-all duration-700 ease-out"
        style={{
          width: `${actualSize}px`,
          height: `${cubeHeight}px`,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg) rotateX(-10deg) ${isFlattened ? 'scaleY(0.2)' : 'scaleY(1)'}`
        }}
      >
        {/* Cara frontal */}
        <div
          className={`absolute flex items-center justify-center bg-gradient-to-br ${color} text-white font-bold text-lg border border-white/30 rounded shadow-lg transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${cubeHeight}px`,
            transform: `translateZ(${actualSize/2}px)`,
            fontSize: isFlattened ? '12px' : '16px'
          }}
        >
          {faces[0]}
        </div>
        
        {/* Cara derecha */}
        <div
          className={`absolute flex items-center justify-center bg-gradient-to-br ${color} text-white font-bold text-lg border border-white/30 rounded shadow-lg opacity-80 transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${cubeHeight}px`,
            transform: `rotateY(90deg) translateZ(${actualSize/2}px)`,
            fontSize: isFlattened ? '12px' : '16px'
          }}
        >
          {faces[1]}
        </div>
        
        {/* Cara trasera */}
        <div
          className={`absolute flex items-center justify-center bg-gradient-to-br ${color} text-white font-bold text-lg border border-white/30 rounded shadow-lg opacity-60 transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${cubeHeight}px`,
            transform: `rotateY(180deg) translateZ(${actualSize/2}px)`,
            fontSize: isFlattened ? '12px' : '16px'
          }}
        >
          {faces[2]}
        </div>
        
        {/* Cara izquierda */}
        <div
          className={`absolute flex items-center justify-center bg-gradient-to-br ${color} text-white font-bold text-lg border border-white/30 rounded shadow-lg opacity-80 transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${cubeHeight}px`,
            transform: `rotateY(-90deg) translateZ(${actualSize/2}px)`,
            fontSize: isFlattened ? '12px' : '16px'
          }}
        >
          {faces[3]}
        </div>
        
        {/* Cara superior */}
        <div
          className={`absolute bg-gradient-to-br ${color} border border-white/30 rounded shadow-lg opacity-40 transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${actualSize}px`,
            transform: `rotateX(90deg) translateZ(${cubeHeight/2}px)`
          }}
        />
        
        {/* Cara inferior */}
        <div
          className={`absolute bg-gradient-to-br ${color} border border-white/30 rounded shadow-lg opacity-40 transition-all duration-700`}
          style={{
            width: `${actualSize}px`,
            height: `${actualSize}px`,
            transform: `rotateX(-90deg) translateZ(${cubeHeight/2}px)`
          }}
        />
      </div>
    </div>
  );
}
