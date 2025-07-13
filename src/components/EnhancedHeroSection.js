'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ArrowRight } from 'lucide-react';

// Enhanced Hero Section with beautiful animations
export default function EnhancedHeroSection({ translations, className, style, children }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations?.en || {});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const [rainIntensity, setRainIntensity] = useState(0); // 0-100 for rain intensity
  const [timeOfDay, setTimeOfDay] = useState(isDark ? 'night' : 'day');
  const [windIntensity, setWindIntensity] = useState(1); // 1-5 for wind intensity
  const lastRenderTime = useRef(0);
  const frameRef = useRef(null);
  const prefersReducedMotion = useRef(false);
  const containerRef = useRef(null);

  // Check if user prefers reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Update translations when language changes with a transition effect
  useEffect(() => {
    if (language && translations) {
      setIsTransitioning(true);
      setTimeout(() => {
        setTrans(translations[language] || translations.en);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  }, [language, translations]);

  // Set initial loaded state for entrance animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Start with some rain if in dark mode
    setRainIntensity(isDark ? 30 : 10);
    
    // Set time of day based on theme
    setTimeOfDay(isDark ? 'night' : 'day');
    
    return () => clearTimeout(timer);
  }, [isDark]);

  // Periodically change the rain intensity and wind
  useEffect(() => {
    // Skip animations for users who prefer reduced motion
    if (prefersReducedMotion.current) return;
    
    const environmentInterval = setInterval(() => {
      // Random chance to change rain intensity
      if (Math.random() > 0.7) {
        setRainIntensity(prev => {
          // Calculate a new intensity that changes gradually
          const change = Math.floor(Math.random() * 30) - 15; // -15 to +15
          let newIntensity = prev + change;
          
          // Keep within bounds (0-50 for light theme, 0-70 for dark theme)
          const maxIntensity = isDark ? 70 : 50;
          return Math.max(0, Math.min(maxIntensity, newIntensity));
        });
        
        // Also update wind intensity
        setWindIntensity(Math.max(1, Math.min(5, Math.floor(Math.random() * 5) + 1)));
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(environmentInterval);
  }, [isDark]);

  // Track mouse movement for parallax effect with throttling for performance
  useEffect(() => {
    // Skip for reduced motion preference
    if (prefersReducedMotion.current) return;
    
    const handleMouseMove = (e) => {
      // Throttle updates for better performance
      const now = Date.now();
      if (now - lastRenderTime.current < 50) { // Limit to ~20fps for mouse tracking
        return;
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        // Get container bounds
        let rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        if (containerRef.current) {
          rect = containerRef.current.getBoundingClientRect();
        }
        
        // Calculate relative position (0-1)
        const relativeX = (e.clientX - rect.left) / rect.width;
        const relativeY = (e.clientY - rect.top) / rect.height;
        
        setMousePosition({
          x: relativeX,
          y: relativeY,
          clientX: e.clientX,
          clientY: e.clientY
        });
        lastRenderTime.current = now;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Inline styles for language transition
  const contentStyle = {
    opacity: isTransitioning ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  // Utility function to apply language-specific line height adjustments
  const getTextStyle = (baseStyle = {}) => {
    const langLineHeight = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return {
      ...baseStyle,
      lineHeight: langLineHeight,
      transition: 'all 0.3s ease'
    };
  };

  // Animation styles - memoized to prevent recalculation on every render
  const animationStyles = useMemo(() => ({
    heroBackground: {
      background: isDark 
        ? `linear-gradient(to right, #1e4620, #2c5f31)` 
        : `linear-gradient(to right, #4CAF50, #2E7D32)`,
      position: 'relative',
      overflow: 'hidden',
      ...style
    },
    heroContent: {
      position: 'relative',
      zIndex: 10
    },
    titleLine1: {
      transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease',
      transitionDelay: '0.1s'
    },
    titleLine2: {
      transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease',
      transitionDelay: '0.3s'
    },
    titleLine3: {
      transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease',
      transitionDelay: '0.5s'
    },
    subtitle: {
      transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease',
      transitionDelay: '0.7s'
    },
    ctaButtons: {
      transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease',
      transitionDelay: '0.9s'
    },
    heroImage: {
      transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
      opacity: isLoaded ? 1 : 0,
      transition: 'transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 1.2s ease',
      transitionDelay: '0.5s',
      boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : 
                          '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
    },
    // Animated background elements
    bgCircle1: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: isDark ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.1)',
      top: '10%',
      left: '5%',
      filter: 'blur(40px)',
      animation: 'float 8s ease-in-out infinite',
      transform: `translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)`,
      transition: 'transform 0.3s ease-out',
      willChange: 'transform'
    },
    bgCircle2: {
      position: 'absolute',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: isDark ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.15)',
      bottom: '10%',
      right: '10%',
      filter: 'blur(30px)',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: '1s',
      transform: `translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 20}px)`,
      transition: 'transform 0.3s ease-out',
      willChange: 'transform'
    },
    bgCircle3: {
      position: 'absolute',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: isDark ? 'rgba(129, 199, 132, 0.08)' : 'rgba(129, 199, 132, 0.15)',
      top: '60%',
      left: '30%',
      filter: 'blur(25px)',
      animation: 'float 7s ease-in-out infinite',
      animationDelay: '2s',
      transform: `translateX(${mousePosition.x * 15}px) translateY(${mousePosition.y * 15}px)`,
      transition: 'transform 0.3s ease-out',
      willChange: 'transform'
    },
    // Sun and Moon
    celestialBody: {
      position: 'absolute',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      top: '15%',
      right: '10%',
      zIndex: 3,
      animation: 'celestialGlow 8s infinite ease-in-out',
      transform: `translateY(${mousePosition.y * -15}px)`,
      transition: 'all 2s ease-in-out, transform 0.3s ease-out',
      boxShadow: timeOfDay === 'day' 
        ? `0 0 60px rgba(255, 236, 95, ${isDark ? 0.3 : 0.6})` 
        : `0 0 30px rgba(255, 255, 255, ${isDark ? 0.3 : 0.15})`,
      background: timeOfDay === 'day'
        ? 'radial-gradient(circle, rgba(255,236,95,1) 0%, rgba(255,167,38,1) 100%)'
        : 'radial-gradient(circle, rgba(240,240,240,1) 0%, rgba(189,189,189,1) 100%)',
      willChange: 'transform, box-shadow'
    },
    // Cloud styles - keeping original cloud styles as requested
    cloud1: {
      position: 'absolute',
      top: '12%',
      left: '-15%',
      width: '180px',
      height: '60px',
      background: isDark ? 'rgba(224, 224, 224, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '50px',
      animation: 'cloudDrift1 80s linear infinite',
      zIndex: 2,
      filter: 'blur(1px)',
      opacity: rainIntensity > 10 ? 0.9 : 0.7,
      transition: 'opacity 2s ease',
      willChange: 'transform'
    },
    cloud2: {
      position: 'absolute',
      top: '25%',
      left: '-25%',
      width: '220px',
      height: '50px',
      background: isDark ? 'rgba(224, 224, 224, 0.25)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '50px',
      animation: 'cloudDrift2 65s linear infinite',
      zIndex: 2,
      filter: 'blur(1px)',
      opacity: rainIntensity > 10 ? 0.85 : 0.6,
      transition: 'opacity 2s ease',
      willChange: 'transform'
    },
    cloud3: {
      position: 'absolute',
      top: '8%',
      left: '-10%',
      width: '160px',
      height: '40px',
      background: isDark ? 'rgba(224, 224, 224, 0.15)' : 'rgba(255, 255, 255, 0.7)',
      borderRadius: '50px',
      animation: 'cloudDrift3 90s linear infinite',
      zIndex: 2,
      filter: 'blur(1px)',
      opacity: rainIntensity > 10 ? 0.8 : 0.5,
      transition: 'opacity 2s ease',
      willChange: 'transform'
    },
    // Bird container
    birdContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 5
    }
  }), [isLoaded, isDark, mousePosition.x, mousePosition.y, rainIntensity, style, timeOfDay]);

  // Generate dynamic raindrops - memoized for performance
  const raindrops = useMemo(() => {
    if (rainIntensity <= 0 || prefersReducedMotion.current) return [];
    
    const drops = [];
    const count = Math.floor(rainIntensity / 2); // 0-50 intensity gives 0-25 drops
    
    for (let i = 0; i < count; i++) {
      // Staggered rain pattern
      const delay = Math.random() * 3;
      const duration = 0.5 + Math.random();
      const leftPos = Math.random() * 100;
      const size = 1 + Math.random() * 2;
      
      drops.push({
        key: `raindrop-${i}`,
        style: {
          position: 'absolute',
          top: '-20px',
          left: `${leftPos}%`,
          width: `${size}px`,
          height: `${size * 8}px`,
          background: isDark ? 'rgba(178, 235, 242, 0.6)' : 'rgba(0, 131, 143, 0.3)',
          borderRadius: '50px',
          animation: `raindropFall ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          zIndex: 4,
          opacity: 0.8,
          willChange: 'transform'
        }
      });
    }
    
    return drops;
  }, [rainIntensity, isDark, prefersReducedMotion.current]);

  // Generate multiple birds with different behaviors
  const birds = useMemo(() => {
    if (prefersReducedMotion.current) return [];
    
    const birds = [];
    const birdCount = 8; // Total number of birds
    
    for (let i = 0; i < birdCount; i++) {
      // Calculate different flight paths and timings
      const delay = i * 2;
      const duration = 25 + Math.random() * 30;
      const size = 0.3 + Math.random() * 0.4;
      const yPos = 10 + Math.random() * 30;
      const animationName = `flyBird${i % 4 + 1}`; // Use 4 different flight patterns
      
      birds.push({
        key: `bird-${i}`,
        style: {
          position: 'absolute',
          top: `${yPos}%`,
          left: '0',
          width: '100%',
          height: '100%',
          animation: `${animationName} ${duration}s infinite linear`,
          animationDelay: `${delay}s`,
          opacity: isDark ? 0.4 : 0.6,
          transform: `scale(${size})`,
          zIndex: 5,
          willChange: 'transform'
        }
      });
    }
    
    return birds;
  }, [isDark, prefersReducedMotion.current]);

  // Generate rice plants with SVG - with mouse movement responsiveness
  const generateRicePlants = useMemo(() => {
    if (prefersReducedMotion.current) {
      // For reduced motion, just a few static plants
      return Array(20).fill().map((_, i) => ({
        key: `rice-static-${i}`,
        position: {
          left: 1 + Math.random() * 98,
          bottom: 1 + Math.random() * 25,
          size: 20 + Math.random() * 15
        },
        style: {
          position: 'absolute',
          bottom: `${1 + Math.random() * 25}%`,
          left: `${1 + Math.random() * 98}%`,
          width: `${20 + Math.random() * 15}px`,
          height: `${40 + Math.random() * 20}px`,
          transform: 'translateX(-50%)',
          zIndex: 7
        }
      }));
    }
    
    // Generate rice plants that will respond to mouse movement
    const plants = [];
    const plantCount = 40;
    
    for (let i = 0; i < plantCount; i++) {
      // Distribute across the bottom of the screen
      const leftPos = 1 + Math.random() * 98; // 1-99% horizontal position
      const bottomPos = 1 + Math.random() * 25; // 1-26% from bottom
      const size = 20 + Math.random() * 15; // Varied sizes
      const height = 40 + Math.random() * 20;
      const delay = i * 0.2;
      
      // Random variations for each plant
      const seedCount = 3 + Math.floor(Math.random() * 3); // 3-5 seeds
      const stemColor = isDark ? '#D7CCC8' : '#A1887F';
      const seedColor = isDark ? '#FFE082' : '#FFC107';
      
      // Store position data for mouse interaction calculations
      plants.push({
        key: `rice-plant-${i}`,
        position: {
          left: leftPos,
          bottom: bottomPos,
          size: size,
          height: height
        },
        style: {
          position: 'absolute',
          bottom: `${bottomPos}%`,
          left: `${leftPos}%`,
          width: `${size}px`,
          height: `${height}px`,
          zIndex: 7,
          willChange: 'transform',
          opacity: bottomPos > 15 ? 0.85 : 1, // Slightly fade out the ones further back
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        },
        seedCount,
        stemColor,
        seedColor
      });
    }
    
    return plants;
  }, [isDark, prefersReducedMotion.current]);

  // Calculate plant transformation based on mouse position
  const calculatePlantTransform = (plant) => {
    if (!mousePosition.clientX || !mousePosition.clientY || prefersReducedMotion.current) {
      return 'translateX(-50%)';
    }

    // Calculate plant center position in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const plantPosX = (plant.position.left / 100) * viewportWidth;
    const plantPosY = viewportHeight - ((plant.position.bottom / 100) * viewportHeight);
    
    // Calculate distance from mouse to plant
    const dx = mousePosition.clientX - plantPosX;
    const dy = mousePosition.clientY - plantPosY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate movement based on distance (closer = more movement)
    const maxDistance = 300; // Maximum distance for effect
    const maxMovement = 30; // Maximum pixel movement
    
    if (distance > maxDistance) {
      // Too far away, just return base transform
      return 'translateX(-50%)';
    }
    
    // Calculate movement strength - inverse of distance (closer = stronger)
    const strength = 1 - (distance / maxDistance);
    
    // Calculate movement direction - away from mouse
    const moveX = (-dx / distance) * strength * maxMovement;
    const moveY = (-dy / distance) * strength * maxMovement;
    
    // Add slight rotation for natural effect
    const rotate = (moveX * 0.2); // Small rotation based on horizontal movement
    
    return `translateX(calc(-50% + ${moveX}px)) translateY(${moveY}px) rotate(${rotate}deg)`;
  };

  // Dynamic animation keyframes
  const keyframes = `
    @keyframes float {
      0% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(-20px) translateX(10px); }
      100% { transform: translateY(0px) translateX(0px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }
    
    @keyframes shine {
      0% { left: -100%; opacity: 0.7; }
      100% { left: 100%; opacity: 0; }
    }
    
    @keyframes fadeScale {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes flyBird1 {
      0% { transform: translate(-100px, 20px) scale(0.6); }
      50% { transform: translate(calc(100vw + 100px), -40px) scale(0.6); }
      50.01% { transform: translate(-100px, 50px) scale(0.5); }
      100% { transform: translate(calc(100vw + 100px), 30px) scale(0.5); }
    }

    @keyframes flyBird2 {
      0% { transform: translate(-150px, 100px) scale(0.4); }
      40% { transform: translate(calc(50vw), 120px) scale(0.4); }
      100% { transform: translate(calc(100vw + 150px), 70px) scale(0.4); }
    }

    @keyframes flyBird3 {
      0% { transform: translate(calc(100vw + 50px), 50px) scale(0.35); }
      100% { transform: translate(-150px, 30px) scale(0.35); }
    }

    @keyframes flyBird4 {
      0% { transform: translate(-100px, 80px) scale(0.35) rotateY(180deg); }
      50% { transform: translate(calc(100vw + 100px), 50px) scale(0.35) rotateY(180deg); }
      50.01% { transform: translate(calc(100vw + 100px), 60px) scale(0.3) rotateY(0deg); }
      100% { transform: translate(-100px, 30px) scale(0.3) rotateY(0deg); }
    }

    @keyframes raindropFall {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(130vh);
        opacity: 0;
      }
    }
    
    @keyframes cloudDrift1 {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(100vw + 200px)); }
    }
    
    @keyframes cloudDrift2 {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(100vw + 300px)); }
    }
    
    @keyframes cloudDrift3 {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(100vw + 250px)); }
    }
    
    @keyframes celestialGlow {
      0%, 100% { box-shadow: 0 0 30px rgba(255, 236, 95, 0.6); }
      50% { box-shadow: 0 0 60px rgba(255, 236, 95, 0.8); }
    }
    
    @keyframes seedSway {
      0% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
      100% { transform: rotate(-3deg); }
    }
  `;

  // Bird SVG Component
  const BirdSVG = React.memo(({ style }) => {
    if (!style) return null;
    
    return (
      <div style={style}>
        <svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M36 0C32 0 28 4 24 4C20 4 16 0 12 0C8 0 4 4 0 4V8C4 8 8 4 12 4C16 4 20 8 24 8C28 8 32 4 36 4V0Z" 
            fill={isDark ? "#E8F5E9" : "#1B5E20"} fillOpacity={isDark ? 0.6 : 0.5} />
        </svg>
      </div>
    );
  });
  BirdSVG.displayName = 'BirdSVG';

  // Cloud SVG with bubble shapes
  const CloudSVG = React.memo(({ style }) => {
    if (!style) return null;
    
    return (
      <div style={style}>
        <div style={{ 
          position: 'absolute',
          top: '-20px',
          left: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: style.background
        }}></div>
        <div style={{ 
          position: 'absolute',
          top: '-30px',
          left: '70px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: style.background
        }}></div>
        <div style={{ 
          position: 'absolute',
          top: '-20px',
          left: '120px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: style.background
        }}></div>
      </div>
    );
  });
  CloudSVG.displayName = 'CloudSVG';

  // Rice Plant SVG Component with interactive movement
  const RicePlantSVG = React.memo(({ plant }) => {
    if (!plant || !plant.style) return null;
    
    // Calculate transform based on mouse position
    const transform = calculatePlantTransform(plant);
    
    // Calculate stem and seed positions
    const stemWidth = plant.position.size * 0.06; // Thin stem
    const stemHeight = plant.position.height * 0.8; // 80% of total height
    
    // Generate seeds (rice grains)
    const seeds = [];
    const seedSpread = plant.position.size * 0.4; // How wide seeds spread
    
    for (let i = 0; i < plant.seedCount; i++) {
      const angle = (i / (plant.seedCount - 1)) * 180 - 90; // -90 to 90 degrees
      const radAngle = angle * (Math.PI / 180);
      const x = seedSpread * Math.cos(radAngle);
      const topOffset = i % 2 === 0 ? 5 : 0; // Alternate heights for natural look
      
      seeds.push(
        <g key={`seed-${i}`} transform={`translate(${x}, ${-stemHeight - 10 - topOffset})`}>
          {/* Rice seed (oval shaped) */}
          <ellipse 
            cx="0" 
            cy="0" 
            rx="4" 
            ry="8" 
            fill={plant.seedColor} 
            opacity="0.95"
            transform={`rotate(${angle})`}
            style={{ animation: `seedSway 3s ease-in-out infinite` }}
          />
        </g>
      );
    }
    
    return (
      <div 
        key={plant.key} 
        style={{
          ...plant.style,
          transform: transform
        }}
      >
        <svg width="100%" height="100%" viewBox={`${-plant.position.size/2} 0 ${plant.position.size} ${plant.position.height}`} preserveAspectRatio="xMidYMax meet">
          {/* Stem */}
          <line 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={-stemHeight} 
            stroke={plant.stemColor} 
            strokeWidth={stemWidth} 
            strokeLinecap="round"
          />
          
          {/* Seeds/Rice grains */}
          {seeds}
        </svg>
      </div>
    );
  });
  RicePlantSVG.displayName = 'RicePlantSVG';

  // Get rice plants
  const ricePlants = useMemo(() => generateRicePlants, [generateRicePlants]);

  return (
    <>
      <style>{keyframes}</style>
      <div 
        ref={containerRef}
        className={`text-white relative ${className || ''}`}
        style={animationStyles.heroBackground}
      >
        {/* Sun or Moon */}
        <div style={animationStyles.celestialBody}></div>
        
        {/* Animated background circles */}
        <div style={animationStyles.bgCircle1}></div>
        <div style={animationStyles.bgCircle2}></div>
        <div style={animationStyles.bgCircle3}></div>

        {/* Cloud formations - keep all three as in original */}
        <CloudSVG style={animationStyles.cloud1} />
        <CloudSVG style={animationStyles.cloud2} />
        <CloudSVG style={animationStyles.cloud3} />

        {/* Flying birds */}
        {birds.filter(bird => bird && bird.style).map(bird => (
          <BirdSVG key={bird.key} style={bird.style} />
        ))}
        
        {/* Raindrops */}
        {raindrops.filter(drop => drop && drop.style).map(drop => (
          <div key={drop.key} style={drop.style}></div>
        ))}
        
        {/* SVG Rice plants - interactive with mouse */}
        {ricePlants.filter(plant => plant && plant.style).map(plant => (
          <RicePlantSVG key={plant.key} plant={plant} />
        ))}
        
        {/* Main content */}
        {children || (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32" style={animationStyles.heroContent}>
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2">
                {/* Title with staggered animation */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={getTextStyle()}>
                  <span 
                    className="block mb-2" 
                    style={{...contentStyle, ...animationStyles.titleLine1}}
                  >
                    {trans.hero?.title?.line1 || ''}
                  </span>
                  <span 
                    className="block mb-2 text-3xl md:text-4xl" 
                    style={{...contentStyle, ...animationStyles.titleLine2}}
                  >
                    {trans.hero?.title?.line2 || ''}
                  </span>
                  {trans.hero?.title?.line3 && (
                    <span 
                      className="block mb-4" 
                      style={{...contentStyle, ...animationStyles.titleLine3}}
                    >
                      {trans.hero?.title?.line3}
                    </span>
                  )}
                </h1>
                
                {/* Subtitle with animation */}
                <p 
                  className="text-xl md:text-2xl mb-6 text-green-100" 
                  style={{...getTextStyle(), ...contentStyle, ...animationStyles.subtitle}}
                >
                  {trans.hero?.subtitle || ''}
                </p>
                
                {/* Buttons with animation and effects */}
                <div 
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                  style={animationStyles.ctaButtons}
                >
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-all duration-300"
                      style={{
                        ...contentStyle,
                        animation: 'pulse 2s infinite',
                        boxShadow: '0 0 0 rgba(76, 175, 80, 0.4)'
                      }}
                    >
                      {trans.hero?.dashboard || 'Dashboard'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/adviser"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-all duration-300"
                        style={{
                          ...contentStyle,
                          animation: 'pulse 2s infinite',
                          boxShadow: '0 0 0 rgba(76, 175, 80, 0.4)'
                        }}
                      >
                        <span style={getTextStyle()}>
                          {trans.hero?.getStarted || 'Get Started'}
                        </span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      <Link
                        href="/info"
                        className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-800 hover:bg-opacity-30 transition-all duration-300"
                        style={{
                          ...contentStyle,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <span style={getTextStyle()}>
                          {trans.hero?.learnMore || 'Learn More'}
                        </span>
                        <span 
                          className="absolute inset-0 overflow-hidden" 
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            transform: 'translateX(-100%)',
                            animation: 'shine 2s infinite',
                            animationDelay: '1s'
                          }}
                        />
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Image container with animation */}
              <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
                <div 
                  className="rounded-lg overflow-hidden w-full max-w-md"
                  style={{
                    ...animationStyles.heroImage,
                    transform: `${animationStyles.heroImage.transform} translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * -10}px)`,
                  }}
                >
                  <img
                    src="/images/cad.gif"
                    alt="Smart Crop Adviser Animation"
                    className="w-full h-64 object-cover"
                    style={{ 
                      objectPosition: "center",
                      transition: 'transform 0.3s ease',
                      transform: 'scale(1.05)',
                    }}
                    onError={(e) => {
                      // Multiple fallback options
                      if (e.target.src.includes('cad.gif')) {
                        // First fallback: try a different image path
                        e.target.src = "/images/agriculture-hero.jpg";
                      } else if (e.target.src.includes('agriculture-hero.jpg')) {
                        // Second fallback: use a placeholder service
                        e.target.src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80";
                        e.target.alt = "Sri Lankan Agriculture";
                      } else {
                        // Final fallback: create a styled placeholder
                        e.target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-64 flex items-center justify-center text-white text-lg font-semibold';
                        placeholder.style.background = `linear-gradient(135deg, ${isDark ? '#2E7D32, #4CAF50' : '#4CAF50, #66BB6A'})`;
                        placeholder.innerHTML = `
                          <div class="text-center">
                            <div class="text-4xl mb-2">🌾</div>
                            <div>${language === 'si' ? 'ස්මාර්ට් බෝග උපදේශක' : language === 'ta' ? 'ஸ்மார்ட் பயிர் ஆலோசகர்' : 'Smart Crop Adviser'}</div>
                          </div>
                        `;
                        e.target.parentNode.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}