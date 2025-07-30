import { assets } from '../assets';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-auto', // Reducido de h-14 a h-12
    md: 'h-16 w-auto', // Reducido de h-20 a h-16  
    lg: 'h-20 w-auto'  // Reducido de h-28 a h-20
  };

  // Usar preferentemente el logo animado si está disponible
  const assetsWithAnimation = assets as typeof assets & { logoAnimated?: string };
  const logoSource = assetsWithAnimation.logoAnimated || assets.logo;
  
  if (logoSource) {
    return (
      <img 
        src={logoSource} 
        alt="FestiBox" 
        className={`${sizeClasses[size]} ${className} object-contain`}
      />
    );
  }

  // Fallback: SVG placeholder basado en tu diseño
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 240 90" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo turquesa como tu logo */}
        <path 
          d="M25 20 L200 20 Q215 20 215 30 L215 60 Q215 70 200 70 L40 70 Q25 70 20 60 Z" 
          fill="#0891b2"
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="6,6"
        />
        
        {/* Texto FESTIBOX */}
        <text 
          x="120" 
          y="52" 
          textAnchor="middle" 
          fill="white" 
          fontSize="22" 
          fontWeight="bold" 
          fontFamily="Inter, sans-serif"
          letterSpacing="1px"
        >
          FESTIBOX
        </text>
        
        {/* Triangulos decorativos como en tu logo */}
        <polygon points="8,25 18,8 28,25" fill="#ec4899"/>
        <polygon points="210,65 220,50 230,65" fill="#f59e0b"/>
        
        {/* Caja de regalo */}
        <g transform="translate(185, 15)">
          <rect x="0" y="18" width="24" height="18" fill="#f59e0b"/>
          <rect x="0" y="24" width="24" height="6" fill="#ec4899"/>
          <rect x="10" y="12" width="4" height="24" fill="#dc2626"/>
          <path d="M10,12 Q14,6 18,12" stroke="#dc2626" strokeWidth="2" fill="none"/>
          <path d="M10,12 Q6,6 10,12" stroke="#dc2626" strokeWidth="2" fill="none"/>
        </g>
      </svg>
    </div>
  );
}
