import React, { useEffect, useRef } from "react";

export default function CognitiveBlackholeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Mouse interactive coordinates for the parallax "movable" effect
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Particle parameters for memory nodes pulled into the core
    interface Particle {
      x: number;
      y: number;
      angle: number;
      distance: number;
      speed: number;
      size: number;
      color: string;
      alpha: number;
      pulseSpeed: number;
    }

    interface LightBeam {
      width: number;
      alpha: number;
      speed: number;
      phase: number;
      offsetY: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 80;
    
    // Create floating digital dots & micro-particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        distance: 80 + Math.random() * (Math.max(width, height) * 0.6),
        speed: 0.15 + Math.random() * 0.5,
        size: 0.6 + Math.random() * 2.0,
        color: i % 4 === 0 
          ? "rgba(168, 85, 247, 0.8)"  // Violet
          : i % 4 === 1 
          ? "rgba(99, 102, 241, 0.8)"  // Indigo
          : i % 4 === 2 
          ? "rgba(192, 132, 252, 0.9)" // Light purple
          : "rgba(255, 255, 255, 0.95)", // White highlight
        alpha: 0.15 + Math.random() * 0.75,
        pulseSpeed: 0.01 + Math.random() * 0.03,
      });
    }

    // Horizontal energy beams (highly intense, bulky like the image)
    const beams: LightBeam[] = [];
    const maxBeams = 6;
    for (let i = 0; i < maxBeams; i++) {
      beams.push({
        width: 2 + Math.random() * 5,
        alpha: 0.2 + Math.random() * 0.4,
        speed: 0.005 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        offsetY: (Math.random() - 0.5) * 25,
      });
    }

    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    // Track mouse position relative to canvas center
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - width / 2;
      const relativeY = e.clientY - rect.top - height / 2;
      // Map to max shift range (e.g., 65 pixels)
      targetMouseX = (relativeX / width) * 110;
      targetMouseY = (relativeY / height) * 80;
    };

    // Reset parallax on mouse leave
    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      time += 0.012;

      // Smoothly interpolate the coordinates for responsive, lag-free parallax
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Center/top coordinates of the blackhole core (with dynamic parallax shift)
      const centerX = width / 2 + mouseX;
      const centerY = height * 0.35 + mouseY;
      
      const baseRadius = Math.min(width, height) * 0.14;
      const bhRadius = baseRadius + Math.sin(time * 2.5) * 3; // Pulsing core size

      // Clear canvas for full transparency
      ctx.clearRect(0, 0, width, height);

      // Draw subtle transparent spatial gradients for the core atmosphere
      const bgGrad = ctx.createRadialGradient(centerX, centerY, bhRadius * 0.3, centerX, centerY, Math.max(width, height) * 1.1);
      bgGrad.addColorStop(0, "rgba(1, 1, 3, 0.4)");
      bgGrad.addColorStop(0.2, "rgba(2, 3, 9, 0.25)");
      bgGrad.addColorStop(0.5, "rgba(4, 6, 17, 0.1)");
      bgGrad.addColorStop(0.8, "rgba(5, 7, 21, 0.05)");
      bgGrad.addColorStop(1, "rgba(1, 2, 6, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw high-tech micro cybernetic grids
      ctx.strokeStyle = "rgba(168, 85, 247, 0.012)";
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        // Shift grid slightly with parallax for 3D depth of field
        const shiftedX = x + mouseX * 0.2;
        ctx.moveTo(shiftedX, 0);
        ctx.lineTo(shiftedX, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        const shiftedY = y + mouseY * 0.2;
        ctx.moveTo(0, shiftedY);
        ctx.lineTo(width, shiftedY);
        ctx.stroke();
      }

      // 1. BACK BULK GLOW (Volumetric cinematic ambient violet light)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const backGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bhRadius * 4);
      backGlow.addColorStop(0, "rgba(147, 51, 234, 0.32)");
      backGlow.addColorStop(0.4, "rgba(99, 102, 241, 0.14)");
      backGlow.addColorStop(0.7, "rgba(168, 85, 247, 0.03)");
      backGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = backGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bhRadius * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw subtle holographic UI brackets (shifting with slower parallax)
      ctx.strokeStyle = "rgba(168, 85, 247, 0.07)";
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(mouseX * 0.4, mouseY * 0.4);
      ctx.beginPath();
      // Draw left brackets
      ctx.moveTo(40, 40); ctx.lineTo(75, 40);
      ctx.moveTo(40, 40); ctx.lineTo(40, 75);
      // Draw right brackets
      ctx.moveTo(width - 40, 40); ctx.lineTo(width - 75, 40);
      ctx.moveTo(width - 40, 40); ctx.lineTo(width - 40, 75);
      ctx.stroke();
      ctx.restore();

      // 2. GRAVITATIONALLY BENT LIGHT LOOPS (Einstein Ring - top and bottom curved halos)
      // These are drawn with thick, glowing layers to match the image precisely.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = "rgba(139, 92, 246, 0.8)";
      
      // Top Bending light loop
      ctx.shadowBlur = 25;
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - bhRadius * 0.1, bhRadius * 1.05, bhRadius * 0.75, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - bhRadius * 0.1, bhRadius * 1.03, bhRadius * 0.73, 0, Math.PI + 0.1, Math.PI * 2 - 0.1);
      ctx.stroke();

      // Bottom Bending light loop (slightly asymmetrical/shifted)
      ctx.shadowBlur = 25;
      ctx.strokeStyle = "rgba(99, 102, 241, 0.35)";
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + bhRadius * 0.05, bhRadius * 1.08, bhRadius * 0.8, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + bhRadius * 0.05, bhRadius * 1.06, bhRadius * 0.78, 0, 0.1, Math.PI - 0.1);
      ctx.stroke();
      
      ctx.restore();

      // 3. HORIZONTAL ACCRETION DISK (The super bright bulk horizon belt from the image)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      
      // We layer multiple horizontal ellipses with fading alpha to build "bulk" and intense luminosity
      const diskGlowY = bhRadius * 0.16;
      
      // Deep outer purple disk bulk
      const outerDiskGrad = ctx.createRadialGradient(centerX, centerY, bhRadius * 0.8, centerX, centerY, bhRadius * 4);
      outerDiskGrad.addColorStop(0, "rgba(147, 51, 234, 0.5)");
      outerDiskGrad.addColorStop(0.3, "rgba(99, 102, 241, 0.2)");
      outerDiskGrad.addColorStop(0.7, "rgba(168, 85, 247, 0.05)");
      outerDiskGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.fillStyle = outerDiskGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, bhRadius * 4.2, diskGlowY * 5, Math.sin(time * 0.1) * 0.015, 0, Math.PI * 2);
      ctx.fill();

      // Mid-tier bright violet disk core
      const midDiskGrad = ctx.createRadialGradient(centerX, centerY, bhRadius * 0.5, centerX, centerY, bhRadius * 2.5);
      midDiskGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      midDiskGrad.addColorStop(0.2, "rgba(192, 132, 252, 0.85)");
      midDiskGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.45)");
      midDiskGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = midDiskGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, bhRadius * 3.2, diskGlowY * 3.2, Math.sin(time * 0.1) * 0.01, 0, Math.PI * 2);
      ctx.fill();

      // Central super-luminous energy horizontal line (The White Core Beam)
      const whiteLineGrad = ctx.createLinearGradient(centerX - bhRadius * 3.5, centerY, centerX + bhRadius * 3.5, centerY);
      whiteLineGrad.addColorStop(0, "rgba(139, 92, 246, 0)");
      whiteLineGrad.addColorStop(0.2, "rgba(168, 85, 247, 0.4)");
      whiteLineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.98)");
      whiteLineGrad.addColorStop(0.8, "rgba(99, 102, 241, 0.4)");
      whiteLineGrad.addColorStop(1, "rgba(99, 102, 241, 0)");

      ctx.strokeStyle = whiteLineGrad;
      ctx.shadowColor = "rgba(168, 85, 247, 0.9)";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(centerX - bhRadius * 3.8, centerY);
      ctx.lineTo(centerX + bhRadius * 3.8, centerY);
      ctx.stroke();

      // Core white accent line (highest intensity)
      ctx.strokeStyle = "#ffffff";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(centerX - bhRadius * 2.5, centerY);
      ctx.lineTo(centerX + bhRadius * 2.5, centerY);
      ctx.stroke();

      ctx.restore();

      // 4. BULKY VOLUMETRIC PLASMA WAVES (background energy horizon)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        // Waves shift with parallax coordinate modifiers
        const waveY = centerY + Math.sin(time + i) * 10;
        ctx.moveTo(0, waveY);
        for (let x = 0; x < width; x += 15) {
          const waveHeight = Math.sin(x * 0.003 + time + i) * 22 + Math.cos(x * 0.0015 - time) * 8;
          ctx.lineTo(x, waveY + waveHeight);
        }
        ctx.strokeStyle = i === 0 
          ? "rgba(168, 85, 247, 0.18)" 
          : i === 1 
          ? "rgba(99, 102, 241, 0.15)" 
          : "rgba(192, 132, 252, 0.12)";
        ctx.lineWidth = 6 + i * 4; // Thick volumetric brush width
        ctx.stroke();
      }
      ctx.restore();

      // 5. INTENSE CINEMATIC HORIZONTAL LIGHT BEAMS (stretched lens flares)
      beams.forEach((beam) => {
        beam.phase += beam.speed;
        const beamY = centerY + beam.offsetY + Math.sin(beam.phase) * 15;
        
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        
        const beamGlow = ctx.createLinearGradient(0, beamY, width, beamY);
        const dynamicAlpha = beam.alpha * (0.85 + Math.sin(time * 4 + beam.phase) * 0.15);
        beamGlow.addColorStop(0, "rgba(168, 85, 247, 0)");
        beamGlow.addColorStop(0.35, `rgba(168, 85, 247, ${dynamicAlpha * 0.5})`);
        beamGlow.addColorStop(0.5, `rgba(255, 255, 255, ${dynamicAlpha * 1.6})`);
        beamGlow.addColorStop(0.65, `rgba(99, 102, 241, ${dynamicAlpha * 0.5})`);
        beamGlow.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.beginPath();
        ctx.strokeStyle = beamGlow;
        ctx.lineWidth = beam.width;
        ctx.moveTo(0, beamY);
        ctx.lineTo(width, beamY);
        ctx.stroke();
        
        ctx.restore();
      });

      // 6. ROTATING SPATIAL ACCRETION RINGS
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      
      // Thin dash ring representing digital coordinate orbit aligned to the tilt
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, bhRadius * 1.5, bhRadius * 0.4, -time * 0.1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Rotating dashed ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, bhRadius * 1.25, bhRadius * 0.35, time * 0.15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.setLineDash([8, 12]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]); // Reset
      
      ctx.restore();

      // 7. MEMORY MATRIX PARTICLES (orbiting and pulled into the Event Horizon)
      particles.forEach((p) => {
        p.angle += p.speed * 0.016;
        // Gravitational pull towards the central core
        p.distance -= p.speed * 0.65;
        
        // Reset particle coordinates once sucked into the singularity
        if (p.distance < bhRadius * 0.5) {
          p.distance = bhRadius * 1.2 + Math.random() * (Math.max(width, height) * 0.55);
          p.angle = Math.random() * Math.PI * 2;
          p.alpha = 0.1 + Math.random() * 0.8;
        }

        // Oblong dynamic perspective projection relative to the central singularity
        const px = centerX + Math.cos(p.angle) * p.distance;
        const py = centerY + Math.sin(p.angle) * p.distance * 0.35; // Flat accretion disc perspective

        const alphaMultiplier = Math.min(1, (p.distance - bhRadius * 0.5) / 100);
        const sizePulse = p.size * (0.8 + Math.sin(time * p.pulseSpeed * 100) * 0.2);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * alphaMultiplier;
        ctx.beginPath();
        ctx.arc(px, py, sizePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 8. THE DEEP MYSTERIOUS SINGULARITY CORE (Pure blackhole center silencing all light)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, bhRadius * 0.48, 0, Math.PI * 2);
      ctx.fillStyle = "#010103";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      // 9. EVENT HORIZON INNER RING GLOW (High-intensity neon violet frame)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "rgba(168, 85, 247, 0.98)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bhRadius * 0.49, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 10. FRONT CINEMATIC LENS FLARE GLOW (A subtle dynamic glare reflecting off the camera)
      const flareX = centerX + Math.sin(time * 0.4) * 40;
      const flareY = centerY + Math.cos(time * 0.4) * 10;
      const flareGrad = ctx.createRadialGradient(flareX, flareY, 1, flareX, flareY, bhRadius * 1.6);
      flareGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      flareGrad.addColorStop(0.15, "rgba(168, 85, 247, 0.12)");
      flareGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.03)");
      flareGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, bhRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 rounded-3xl"
      style={{ mixBlendMode: "screen", opacity: 0.95 }}
    />
  );
}
