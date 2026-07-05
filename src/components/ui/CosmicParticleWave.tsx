import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
  speed: number;
}

export default function CosmicParticleWave() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Cosmic palette mirroring the image (magenta, pink, purple, deep blue, electric cyan)
    const colors = [
      "rgba(219, 39, 119",  // Deep Magenta
      "rgba(244, 63, 94",   // Soft Pink/Rose
      "rgba(147, 51, 234",  // Vibrant Purple
      "rgba(79, 70, 229",   // Indigo Blue
      "rgba(6, 182, 212",   // Electric Cyan
      "rgba(236, 72, 153"   // Bright Pink
    ];

    const particles: Particle[] = [];
    const maxParticles = 1800; // Dense particle count for rich wave effect

    // Generate initial particles
    const createParticle = (initRandom = false): Particle => {
      const x = initRandom ? Math.random() * width : -20 + Math.random() * 20;
      const y = Math.random() * height;
      const size = Math.random() * 1.5 + 0.6; // Tiny glowing dust grains
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        x,
        y,
        vx: Math.random() * 0.8 + 0.2, // Move mostly left-to-right
        vy: (Math.random() - 0.5) * 0.3,
        size,
        color,
        alpha: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries && entries[0]) {
        const { width: entryWidth, height: entryHeight } = entries[0].contentRect;
        width = canvas.width = entryWidth;
        height = canvas.height = entryHeight;
      }
    });
    resizeObserver.observe(canvas);

    let time = 0;

    // Animation loop
    const animate = () => {
      time += 0.002;
      
      // Leaving a slight trail behind particles creates the beautiful nebular gas-cloud effect (as seen in the image!)
      ctx.fillStyle = "rgba(3, 7, 18, 0.09)";
      ctx.fillRect(0, 0, width, height);

      // Use lighter composite operation for brilliant additive glow
      ctx.globalCompositeOperation = "lighter";

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Core Organic Wave Flow Field Motion (using combination of multiple sine/cosine frequencies)
        // This generates the curly, river-like stream lines visible in the image
        const noiseAngle = 
          Math.sin(p.x * 0.003 + time) * 1.5 + 
          Math.cos(p.y * 0.004 - time * 1.2) * 1.2;
        
        // Base flowing velocity
        const flowForceX = Math.cos(noiseAngle) * 0.4 + 0.4; // bias to right
        const flowForceY = Math.sin(noiseAngle) * 0.35;

        p.vx += flowForceX * 0.15;
        p.vy += flowForceY * 0.15;

        // 2. Mouse Interaction: Gravitational swirl & push/pull to make it "movable"
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            // Calculate pull factor (stronger near center, decays further out)
            const force = (1 - dist / 180) * 0.4;
            
            // Perpendicular swirl vector around the cursor
            const angleToMouse = Math.atan2(dy, dx);
            const swirlAngle = angleToMouse + Math.PI / 2; // swirl in orbit
            
            p.vx += Math.cos(swirlAngle) * force * 1.5;
            p.vy += Math.sin(swirlAngle) * force * 1.5;

            // Gentle pull towards cursor
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;
          }
        }

        // Apply friction/drag to prevent infinite acceleration
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders
        if (p.x > width + 10) {
          p.x = -10;
          p.y = Math.random() * height;
          p.vx = Math.random() * 0.8 + 0.2;
          p.vy = (Math.random() - 0.5) * 0.3;
        } else if (p.x < -10) {
          p.x = width + 10;
        }

        if (p.y > height + 10) {
          p.y = -10;
        } else if (p.y < -10) {
          p.y = height + 10;
        }

        // Subtle pulsing transparency
        const currentAlpha = p.alpha * (0.6 + Math.sin(time * 5 + p.phase) * 0.4);

        // Draw particle with glowing aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}, ${currentAlpha})`;
        ctx.fill();

        // Occasional lines between close particles for that organic webbed filament look in the image
        if (i % 35 === 0 && i < particles.length - 1) {
          const nextP = particles[i + 1];
          const distance = Math.sqrt((p.x - nextP.x) ** 2 + (p.y - nextP.y) ** 2);
          if (distance < 55) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nextP.x, nextP.y);
            ctx.strokeStyle = `${p.color}, ${currentAlpha * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Reset composite operation for normal text rendering
      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse Listeners
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block bg-[#030712] pointer-events-auto"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
