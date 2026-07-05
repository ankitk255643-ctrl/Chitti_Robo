import React, { useEffect, useRef } from "react";

export default function IsometricCubesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Mouse interactive coordinates for the parallax effect
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Define cube characteristics
    interface Cube {
      gridX: number; // grid column
      gridY: number; // grid row
      size: number;
      heightScale: number; // vertical elongation
      colorType: "slate" | "orange" | "teal" | "brown";
      phase: number;
      speed: number;
      hoverFactor: number;
    }

    const cubes: Cube[] = [];
    const cols = 8;
    const rows = 8;
    const spacing = 120; // Spacing in grid coordinates

    // Generate a uniform but lively distribution of isometric blocks
    for (let gx = 0; gx < cols; gx++) {
      for (let gy = 0; gy < rows; gy++) {
        // Randomly skip some slots to make a bento/brutalist structural layout
        if ((gx + gy) % 3 === 0 && Math.random() < 0.3) continue;

        // Choose color based on probability to match user's image palette:
        // Mostly slate (charcoal grey/dark blue), with some hot accent orange, teal, and brown.
        const rand = Math.random();
        let colorType: "slate" | "orange" | "teal" | "brown" = "slate";
        if (rand < 0.22) {
          colorType = "orange";
        } else if (rand < 0.35) {
          colorType = "teal";
        } else if (rand < 0.45) {
          colorType = "brown";
        }

        cubes.push({
          gridX: gx - cols / 2,
          gridY: gy - rows / 2,
          size: 32 + Math.random() * 8,
          heightScale: 0.8 + Math.random() * 1.5, // tall prisms
          colorType,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
          hoverFactor: 0,
        });
      }
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - width / 2;
      const relativeY = e.clientY - rect.top - height / 2;
      targetMouseX = (relativeX / width) * 120;
      targetMouseY = (relativeY / height) * 90;
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.01;

      // Interpolate mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Clear with elegant deep dark slate/navy gradient representing empty operations space
      const bgGrad = ctx.createRadialGradient(
        width / 2 + mouseX * 0.5,
        height / 2 + mouseY * 0.5,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#030612");
      bgGrad.addColorStop(0.5, "#020409");
      bgGrad.addColorStop(1, "#010204");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw faint, dreamy background glowing orbs (orange & teal) to simulate lens flare behind empty spaces
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // 1. Teal glow (Top left-ish, shifting with mouse)
      const tealGlow = ctx.createRadialGradient(
        width * 0.35 + mouseX * 0.8,
        height * 0.3 + mouseY * 0.8,
        0,
        width * 0.35 + mouseX * 0.8,
        height * 0.3 + mouseY * 0.8,
        280
      );
      tealGlow.addColorStop(0, "rgba(20, 184, 166, 0.08)");
      tealGlow.addColorStop(0.5, "rgba(13, 148, 136, 0.03)");
      tealGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tealGlow;
      ctx.beginPath();
      ctx.arc(width * 0.35 + mouseX * 0.8, height * 0.3 + mouseY * 0.8, 280, 0, Math.PI * 2);
      ctx.fill();

      // 2. Orange glow (Bottom right-ish)
      const orangeGlow = ctx.createRadialGradient(
        width * 0.7 + mouseX * 1.2,
        height * 0.6 + mouseY * 1.2,
        0,
        width * 0.7 + mouseX * 1.2,
        height * 0.6 + mouseY * 1.2,
        320
      );
      orangeGlow.addColorStop(0, "rgba(249, 115, 22, 0.07)");
      orangeGlow.addColorStop(0.5, "rgba(234, 88, 12, 0.02)");
      orangeGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orangeGlow;
      ctx.beginPath();
      ctx.arc(width * 0.7 + mouseX * 1.2, height * 0.6 + mouseY * 1.2, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Center of the projection grid
      const centerX = width / 2 + mouseX;
      const centerY = height / 2 + mouseY;

      // Slow dynamic rotation angle of the entire grid coordinate system to create a revolving optical illusion
      const globalRotation = Math.sin(time * 0.2) * 0.08 + time * 0.05;

      // Project and calculate render depths for the cubes
      interface ProjectedCube {
        cube: Cube;
        px: number;
        py: number;
        pz: number; // height offset
        depth: number;
        currentSize: number;
      }

      const projected: ProjectedCube[] = [];

      cubes.forEach((cube) => {
        cube.phase += cube.speed;

        // Oscillating height displacement for continuous waving illusion
        const pz = Math.sin(cube.phase) * 15 + Math.cos(cube.phase * 0.5) * 5;

        // Apply grid coordinate rotation around the center
        const rotX = cube.gridX * Math.cos(globalRotation) - cube.gridY * Math.sin(globalRotation);
        const rotY = cube.gridX * Math.sin(globalRotation) + cube.gridY * Math.cos(globalRotation);

        // Map rotating coordinates to 3D isometric projection space
        // 0.866 is cos(30 deg), 0.5 is sin(30 deg)
        const isometricX = (rotX - rotY) * 0.866 * spacing;
        const isometricY = (rotX + rotY) * 0.55 * spacing;

        const px = centerX + isometricX;
        const py = centerY + isometricY;

        // depth factor for Painter's Algorithm sorting (Z-Index equivalent)
        const depth = rotX + rotY;

        projected.push({
          cube,
          px,
          py,
          pz,
          depth,
          currentSize: cube.size,
        });
      });

      // Sort back-to-front based on 3D depth to ensure flawless overlapping rendering
      projected.sort((a, b) => a.depth - b.depth);

      // Render each isometric block
      projected.forEach(({ cube, px, py, pz, currentSize }) => {
        const size = currentSize;
        const h = size * cube.heightScale;

        // Elevate block with our physical waves phase offset (pz)
        const currentY = py - pz;

        // Set colors matching user image exactly
        let baseR = 15;
        let baseG = 23;
        let baseB = 42;

        if (cube.colorType === "orange") {
          baseR = 249;
          baseG = 115;
          baseB = 22; // hot vibrant orange
        } else if (cube.colorType === "teal") {
          baseR = 20;
          baseG = 184;
          baseB = 166; // bright cyber teal
        } else if (cube.colorType === "brown") {
          baseR = 124;
          baseG = 45;
          baseB = 18; // warm rust brown
        } else {
          // charcoal dark slate with ambient blue tint
          baseR = 28;
          baseG = 30;
          baseB = 41;
        }

        // Color shading profiles for isometric lighting
        const topColor = `rgb(${Math.min(255, baseR * 1.25)}, ${Math.min(255, baseG * 1.25)}, ${Math.min(255, baseB * 1.25)})`;
        const leftColor = `rgb(${Math.max(0, baseR * 0.8)}, ${Math.max(0, baseG * 0.8)}, ${Math.max(0, baseB * 0.8)})`;
        const rightColor = `rgb(${Math.max(0, baseR * 0.55)}, ${Math.max(0, baseG * 0.55)}, ${Math.max(0, baseB * 0.55)})`;

        // Screen coordinate offset for 3D faces
        const dx = size * 0.866;
        const dy = size * 0.5;

        // Shadow projection on the base background floor
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.moveTo(px, py + dy);
        ctx.lineTo(px + dx, py);
        ctx.lineTo(px, py - dy);
        ctx.lineTo(px - dx, py);
        ctx.closePath();
        ctx.fill();

        // Face 1: Left Face
        ctx.fillStyle = leftColor;
        ctx.beginPath();
        ctx.moveTo(px - dx, currentY);
        ctx.lineTo(px, currentY + dy);
        ctx.lineTo(px, currentY + dy + h);
        ctx.lineTo(px - dx, currentY + h);
        ctx.closePath();
        ctx.fill();

        // Face 2: Right Face
        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(px, currentY + dy);
        ctx.lineTo(px + dx, currentY);
        ctx.lineTo(px + dx, currentY + h);
        ctx.lineTo(px, currentY + dy + h);
        ctx.closePath();
        ctx.fill();

        // Face 3: Top Face (Rhombus cap)
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(px, currentY - h);
        ctx.lineTo(px + dx, currentY - h - dy);
        ctx.lineTo(px, currentY - h - dy * 2);
        ctx.lineTo(px - dx, currentY - h - dy);
        ctx.closePath();
        ctx.fill();

        // Edge highlights - very elegant 1px highlights on top and leading ridges (like in the user's uploaded image!)
        ctx.strokeStyle = `rgba(255, 255, 255, ${cube.colorType === "slate" ? 0.08 : 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Top front left edge
        ctx.moveTo(px, currentY - h);
        ctx.lineTo(px - dx, currentY - h - dy);
        // Top front right edge
        ctx.moveTo(px, currentY - h);
        ctx.lineTo(px + dx, currentY - h - dy);
        // Center vertical front edge
        ctx.moveTo(px, currentY - h);
        ctx.lineTo(px, currentY + dy);
        ctx.stroke();
      });

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
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.45 }}
    />
  );
}
