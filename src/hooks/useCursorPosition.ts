import { useEffect, useRef, useState, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

interface UseGlassTiltOptions {
  intensity?: number;
  perspective?: number;
  glowIntensity?: number;
}

export const useCursorPosition = () => {
  const [position, setPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      
      setPosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX,
        normalizedY
      });

      // Update CSS custom properties for global cursor tracking
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};

export const useGlassTilt = (options: UseGlassTiltOptions = {}) => {
  const {
    intensity = 8,
    perspective = 1000,
    glowIntensity = 0.15
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation based on mouse position relative to center
    const rotateX = (mouseY / (rect.height / 2)) * -intensity;
    const rotateY = (mouseX / (rect.width / 2)) * intensity;

    // Calculate glow position as percentage
    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      '--cursor-x': `${glowX}%`,
      '--cursor-y': `${glowY}%`,
    } as React.CSSProperties);
  }, [intensity, perspective]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      '--cursor-x': '50%',
      '--cursor-y': '50%',
    } as React.CSSProperties);
  }, [perspective]);

  return {
    ref,
    style,
    isHovering,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

export const useParallax = (speed: number = 0.05) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cursorPos = useCursorPosition();

  useEffect(() => {
    setOffset({
      x: cursorPos.normalizedX * 20 * speed,
      y: cursorPos.normalizedY * 20 * speed
    });
  }, [cursorPos.normalizedX, cursorPos.normalizedY, speed]);

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`
  };
};
