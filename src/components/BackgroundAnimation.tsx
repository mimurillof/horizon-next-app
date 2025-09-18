'use client';

import { useEffect, useRef } from 'react';

/**
 * Particle configuration – tuned for the Horizon theme.
 */
const PARTICLE_CONFIG = {
  count: 80,
  speed: 0.3,
  maxRadius: 3,
  minRadius: 1,
  lineDistance: 150,
  particleColor: 'rgba(125, 249, 255, 0.8)', // #7DF9FF
  lineColor: 'rgba(162, 234, 196, 0.15)' // #A2EAC4
};

/**
 * Single particle in the animation.
 */
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
    this.vy = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
    this.radius = PARTICLE_CONFIG.minRadius + Math.random() * (PARTICLE_CONFIG.maxRadius - PARTICLE_CONFIG.minRadius);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = PARTICLE_CONFIG.particleColor;
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce on edges
    if (this.x < 0 || this.x > this.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.height) this.vy *= -1;
  }
}

/**
 * React component that renders a full-screen animated particle background.
 */
const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create particles
    let particles: Particle[] = Array.from({ length: PARTICLE_CONFIG.count }, () => new Particle(width, height));

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < PARTICLE_CONFIG.lineDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = PARTICLE_CONFIG.lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      connectParticles();

      animationFrame.current = requestAnimationFrame(animate);
    };

    // Resize listener
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = Array.from({ length: PARTICLE_CONFIG.count }, () => new Particle(width, height));
    };

    window.addEventListener('resize', handleResize);

    animate();

    // Cleanup on unmount
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="background-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(to bottom right, #0A192F, #003B46)'
      }}
    />
  );
};

export default BackgroundAnimation; 