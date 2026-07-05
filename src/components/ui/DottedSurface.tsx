"use client"

import { useEffect, useRef } from "react"

interface DottedSurfaceProps {
  className?: string
  dotColor?: string
  backgroundColor?: string
  opacity?: number
}

export default function DottedSurface({
  className = "",
  dotColor = "rgba(255, 255, 255, 0.45)",
  backgroundColor = "transparent",
  opacity = 0.5,
}: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0

    // Set up canvas sizing using ResizeObserver for robustness
    const handleResize = (entries?: ResizeObserverEntry[]) => {
      let rectWidth = 0
      let rectHeight = 0

      if (entries && entries[0]) {
        const entry = entries[0]
        if (entry.contentRect) {
          rectWidth = entry.contentRect.width
          rectHeight = entry.contentRect.height
        }
      }

      if (!rectWidth || !rectHeight) {
        const rect = canvas.getBoundingClientRect()
        rectWidth = rect.width
        rectHeight = rect.height
      }

      // Final fallbacks if elements are hidden/not loaded yet
      if (!rectWidth) rectWidth = window.innerWidth
      if (!rectHeight) rectHeight = window.innerHeight

      const dpr = window.devicePixelRatio || 1
      width = rectWidth
      height = rectHeight
      canvas.width = rectWidth * dpr
      canvas.height = rectHeight * dpr
      ctx.scale(dpr, dpr)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      handleResize(entries)
    })
    
    // Initial size trigger
    handleResize()
    resizeObserver.observe(canvas)

    // Grid configuration
    const cols = 45
    const rows = 35
    const spacingX = 24
    const spacingZ = 20

    // Depth and perspective constants
    const fov = 350
    const cameraY = -120 // camera height above grid

    let time = 0

    // Animation Loop
    const draw = () => {
      ctx.fillStyle = backgroundColor === "transparent" ? "rgba(0, 0, 0, 0)" : backgroundColor
      ctx.clearRect(0, 0, width, height)
      if (backgroundColor !== "transparent") {
        ctx.fillRect(0, 0, width, height)
      }

      time += 0.025

      // Center offset
      const centerX = width / 2
      const centerY = height * 0.55 // Position surface lower on screen for ground/perspective look

      // Store points to draw back-to-front (depth-sorting for proper layering)
      const pointsToRender: Array<{
        x: number
        y: number
        size: number
        alpha: number
        z: number
      }> = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Centered 3D coordinates on grid plane
          const x3d = (c - cols / 2) * spacingX
          const z3d = r * spacingZ + 50 // Keep grid offset from camera

          // Calculate wavy height using double wave logic (col and row harmonics)
          const distanceToCenter = Math.sqrt((c - cols / 2) ** 2 + (r - rows / 2) ** 2)
          const wave1 = Math.sin(c * 0.18 + time) * 12
          const wave2 = Math.cos(r * 0.22 - time * 0.8) * 10
          const wave3 = Math.sin(distanceToCenter * 0.15 - time * 1.2) * 8
          
          const y3d = cameraY + wave1 + wave2 + wave3

          // Perspective scaling factor
          const scale = fov / (fov + z3d)

          // 2D screen projection
          const screenX = centerX + x3d * scale
          const screenY = centerY + y3d * scale

          // Particle styling calculations
          // Fade out based on distance (z3d) and borders
          const zFade = Math.max(0, 1 - z3d / (rows * spacingZ + 100))
          const edgeFadeX = 1 - Math.abs(c - cols / 2) / (cols / 2)
          const alpha = zFade * edgeFadeX

          if (alpha > 0.01 && screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
            // Farther points are smaller, closer points are larger
            const baseSize = 1.3
            const dotSize = baseSize * scale * (1.2 + Math.sin(time + r * 0.2) * 0.3)

            pointsToRender.push({
              x: screenX,
              y: screenY,
              size: Math.max(0.5, dotSize),
              alpha: alpha,
              z: z3d,
            })
          }
        }
      }

      // Sort points from back to front (largest z3d first) so they overlap correctly
      pointsToRender.sort((a, b) => b.z - a.z)

      // Draw each dot with a premium soft-bloom radiant glow effect
      pointsToRender.forEach((p) => {
        // Render background bloom halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, 2 * Math.PI)
        ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${p.alpha * opacity * 0.35})`)
        ctx.fill()

        // Render main bright solid dot core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI)
        ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${p.alpha * opacity * 1.0})`)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [dotColor, backgroundColor, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
    />
  )
}
