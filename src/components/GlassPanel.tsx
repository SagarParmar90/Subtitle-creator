import React, { useRef, useState, useCallback } from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glowColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  as?: 'div' | 'button' | 'section' | 'article';
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  tiltIntensity = 6,
  glowColor = 'rgba(255, 255, 255, 0.15)',
  onClick,
  disabled = false,
  as: Component = 'div',
  style: externalStyle,
  'data-testid': testId
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glowPosition, setGlowPosition] = useState({ x: '50%', y: '50%' });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -tiltIntensity;
    const rotateY = (mouseX / (rect.width / 2)) * tiltIntensity;

    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlowPosition({ x: `${glowX}%`, y: `${glowY}%` });
  }, [tiltIntensity, disabled]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovering(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowPosition({ x: '50%', y: '50%' });
  }, []);

  const combinedStyle: React.CSSProperties = {
    transform: isHovering ? transform : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
    ...externalStyle
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(600px circle at ${glowPosition.x} ${glowPosition.y}, ${glowColor} 0%, transparent 50%)`,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    opacity: isHovering ? 1 : 0,
    transition: 'opacity 0.3s ease'
  };

  return (
    <div
      ref={ref}
      className={`liquid-glass ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={combinedStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      data-testid={testId}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={glowStyle} />
      {children}
    </div>
  );
};

// Smaller variant for cards
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  active = false,
  onClick,
  'data-testid': testId
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        glass-card-sm p-4 cursor-pointer
        ${active ? 'border-[#007AFF]/50 bg-[#007AFF]/10 shadow-[0_0_20px_rgba(0,122,255,0.2)]' : ''}
        ${isHovered && !active ? 'scale-[1.02]' : ''}
        ${className}
      `}
      style={{
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

// Pill button variant
interface GlassPillProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'blue' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

export const GlassPill: React.FC<GlassPillProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  'data-testid': testId
}) => {
  const variantStyles = {
    default: 'bg-white/10 border-white/15 hover:bg-white/15',
    blue: 'bg-[#007AFF]/20 border-[#007AFF]/30 text-[#007AFF] hover:bg-[#007AFF]/30',
    purple: 'bg-[#BF5AF2]/20 border-[#BF5AF2]/30 text-[#BF5AF2] hover:bg-[#BF5AF2]/30',
    pink: 'bg-[#FF2D55]/20 border-[#FF2D55]/30 text-[#FF2D55] hover:bg-[#FF2D55]/30'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base'
  };

  return (
    <button
      className={`
        rounded-full border font-semibold backdrop-blur-xl
        transition-all duration-200 ease-out
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
};
