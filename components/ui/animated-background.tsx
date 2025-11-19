"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface CanvasPalette {
  particleGlow: string;
  particleCore: string;
  connection: string;
  connectionStrength: number;
}

const fallbackPalette: CanvasPalette = {
  particleGlow: "87, 148, 255",
  particleCore: "43, 108, 176",
  connection: "15, 23, 42",
  connectionStrength: 0.35,
};

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [canvasPalette, setCanvasPalette] = useState<CanvasPalette>(fallbackPalette);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const parseStrength = (value: string) => {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallbackPalette.connectionStrength;
    };
    // Reading CSS variables is a valid external system sync
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanvasPalette({
      particleGlow: computed.getPropertyValue("--bg-orbit-particle-glow").trim() || fallbackPalette.particleGlow,
      particleCore: computed.getPropertyValue("--bg-orbit-particle-core").trim() || fallbackPalette.particleCore,
      connection: computed.getPropertyValue("--bg-orbit-connection-rgb").trim() || fallbackPalette.connection,
      connectionStrength: parseStrength(
        computed.getPropertyValue("--bg-orbit-connection-strength").trim(),
      ),
    });
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const particleCount = 110;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1.2,
      opacity: Math.random() * 0.5 + 0.35,
    });

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    };

    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius + 2, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius + 3,
      );
      gradient.addColorStop(
        0,
        `rgba(${canvasPalette.particleGlow}, ${particle.opacity * 0.8})`,
      );
      gradient.addColorStop(1, `rgba(${canvasPalette.particleGlow}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${canvasPalette.particleCore}, ${particle.opacity})`;
      ctx.fill();
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 190) {
            const opacity = (1 - distance / 190) * canvasPalette.connectionStrength;
            ctx.strokeStyle = `rgba(${canvasPalette.connection}, ${opacity})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particles.forEach((particle) => {
        updateParticle(particle);
        drawParticle(particle);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasPalette]);

  return (
    <>
      <div
        className="fixed inset-0 -z-40 transition-colors duration-700"
        style={{ background: "var(--bg-orbit-base)" }}
        suppressHydrationWarning
      />
      <div
        className="fixed inset-0 -z-30 transition-opacity duration-700"
        style={{ background: "var(--bg-orbit-radial)" }}
      />
      <div
        className="fixed inset-0 -z-30 transition-opacity duration-700"
        style={{ background: "var(--bg-orbit-overlay)" }}
      />
      <div
        className="fixed inset-0 -z-20 opacity-60 transition-colors duration-700"
        style={{
          backgroundSize: "46px 46px",
          backgroundImage:
            "linear-gradient(var(--bg-orbit-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bg-orbit-grid-color) 1px, transparent 1px)",
        }}
      />
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
      <div
        className="fixed top-10 left-[15%] h-72 w-72 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-700"
        style={{ backgroundImage: "var(--bg-orbit-top)" }}
      />
      <div
        className="fixed bottom-0 right-[8%] h-80 w-80 translate-y-1/3 rounded-full blur-[120px] transition-opacity duration-700"
        style={{ backgroundImage: "var(--bg-orbit-bottom)" }}
      />
    </>
  );
}
