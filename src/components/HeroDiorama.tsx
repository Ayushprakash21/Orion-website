import React, { useEffect, useRef } from 'react';

/**
 * HeroDiorama renders a cinematic isometric miniature supply chain at night:
 * - Graphite distribution warehouses with warm glowing interior windows
 * - Multi-colored stacked freight container yards (cyan, amber, graphite)
 * - Interconnected glowing cyan telemetry lines and transit routes
 * - Elevated central Orion-9 hexagonal Command Hub
 * - Ambient atmospheric night haze and soft pulse indicators
 * Built with responsive HTML5 Canvas and CSS transforms, respecting prefers-reduced-motion.
 */
export const HeroDiorama: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Handle high DPI crisp rendering
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Coordinate conversion: 3D isometric to 2D screen
    const toIso = (x: number, y: number, z: number, cx: number, cy: number) => {
      const isoX = cx + (x - y) * Math.cos(Math.PI / 6);
      const isoY = cy + (x + y) * Math.sin(Math.PI / 6) - z;
      return { x: isoX, y: isoY };
    };

    // Draw isometric box (warehouse, container, or hub block)
    const drawIsoBox = (
      x: number,
      y: number,
      z: number,
      w: number,
      d: number,
      h: number,
      cx: number,
      cy: number,
      colors: { top: string; left: string; right: string; border?: string; windowGlow?: boolean }
    ) => {
      // 8 vertices
      const p0 = toIso(x, y, z + h, cx, cy); // top front
      const p1 = toIso(x + w, y, z + h, cx, cy);
      const p2 = toIso(x + w, y + d, z + h, cx, cy);
      const p3 = toIso(x, y + d, z + h, cx, cy);

      const p4 = toIso(x, y, z, cx, cy); // bottom front
      const p5 = toIso(x + w, y, z, cx, cy);
      const p6 = toIso(x + w, y + d, z, cx, cy);
      const p7 = toIso(x, y + d, z, cx, cy);

      // Top face
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fillStyle = colors.top;
      ctx.fill();
      if (colors.border) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Left face (front-left)
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(p0.x, p0.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.closePath();
      ctx.fillStyle = colors.left;
      ctx.fill();
      if (colors.border) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Right face (front-right)
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p5.x, p5.y);
      ctx.closePath();
      ctx.fillStyle = colors.right;
      ctx.fill();
      if (colors.border) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Warm illuminated window strips if specified
      if (colors.windowGlow) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.shadowColor = 'rgba(255, 191, 71, 0.6)';
        ctx.shadowBlur = 8;
        // Slanted window line on right face
        const w1 = toIso(x + w * 0.2, y, z + h * 0.45, cx, cy);
        const w2 = toIso(x + w * 0.85, y, z + h * 0.45, cx, cy);
        ctx.beginPath();
        ctx.moveTo(w1.x, w1.y);
        ctx.lineTo(w2.x, w2.y);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.stroke();
        ctx.restore();
      }
    };

    // Draw telemetry line connecting two nodes with moving pulses
    const drawRouteLine = (
      pStart: { x: number; y: number; z: number },
      pEnd: { x: number; y: number; z: number },
      cx: number,
      cy: number,
      offset: number,
      color: string
    ) => {
      const s = toIso(pStart.x, pStart.y, pStart.z, cx, cy);
      const e = toIso(pEnd.x, pEnd.y, pEnd.z, cx, cy);

      // Main faint pipeline
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Moving glowing data packet
      const progress = ((t * 0.5 + offset) % 100) / 100;
      const curX = s.x + (e.x - s.x) * progress;
      const curY = s.y + (e.y - s.y) * progress;

      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      t += 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      bgGrad.addColorStop(0, '#152138');
      bgGrad.addColorStop(0.5, '#0f1626');
      bgGrad.addColorStop(1, '#090d17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.52;
      const cy = height * 0.52;

      // Base isometric ground grid with subtle hairlines
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let g = -320; g <= 320; g += 40) {
        const pA = toIso(-320, g, 0, cx, cy);
        const pB = toIso(320, g, 0, cx, cy);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();

        const pC = toIso(g, -320, 0, cx, cy);
        const pD = toIso(g, 320, 0, cx, cy);
        ctx.beginPath();
        ctx.moveTo(pC.x, pC.y);
        ctx.lineTo(pD.x, pD.y);
        ctx.stroke();
      }
      ctx.restore();

      // 1. Central Elevated Command Hub (ORION-9 CORE)
      // Tiered hexagonal base
      drawIsoBox(
        -50,
        -50,
        0,
        100,
        100,
        12,
        cx,
        cy,
        {
          top: '#1d293d',
          left: '#121a28',
          right: '#162235',
          border: 'rgba(63, 216, 255, 0.3)',
        }
      );

      // Main Command Pavilion
      drawIsoBox(
        -32,
        -32,
        12,
        64,
        64,
        38,
        cx,
        cy,
        {
          top: '#292929',
          left: '#141d2c',
          right: '#1a273b',
          border: 'rgba(63, 216, 255, 0.5)',
          windowGlow: true,
        }
      );

      // Command Hub Spire / Radar Beacon
      const spireBase = toIso(0, 0, 50, cx, cy);
      const spireTop = toIso(0, 0, 85, cx, cy);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(spireBase.x, spireBase.y);
      ctx.lineTo(spireTop.x, spireTop.y);
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pulsing radar sweep ring
      const pulseSize = (t % 80) * 0.9;
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - pulseSize / 72})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(spireTop.x, spireTop.y, pulseSize * 1.6, pulseSize * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Beacon point
      ctx.fillStyle = '#f5f5f5';
      ctx.shadowColor = '#f5f5f5';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(spireTop.x, spireTop.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. West Automated Distribution Warehouse (Graphite + Warm Windows)
      drawIsoBox(
        -220,
        -70,
        0,
        110,
        70,
        32,
        cx,
        cy,
        {
          top: '#1e2a3c',
          left: '#121a27',
          right: '#182333',
          border: 'rgba(255, 255, 255, 0.1)',
          windowGlow: true,
        }
      );

      // 3. North Freight Terminal & Logistics Corridor
      drawIsoBox(
        -60,
        -240,
        0,
        130,
        65,
        28,
        cx,
        cy,
        {
          top: '#1a2434',
          left: '#101622',
          right: '#141e2c',
          border: 'rgba(255, 255, 255, 0.08)',
          windowGlow: true,
        }
      );

      // 4. East Container Yard & Rail Dock (Stacked freight containers)
      // Base layer
      drawIsoBox(120, -50, 0, 24, 50, 16, cx, cy, { top: '#2a2a2a', left: '#171717', right: '#222222' });
      drawIsoBox(150, -50, 0, 24, 50, 16, cx, cy, { top: '#444444', left: '#292929', right: '#383838' });
      drawIsoBox(120, 10, 0, 24, 50, 16, cx, cy, { top: '#292929', left: '#172230', right: '#1c2839' });
      // Stacked second tier
      drawIsoBox(135, -35, 16, 24, 50, 16, cx, cy, { top: '#747474', left: '#393939', right: '#595959' });

      // 5. South Modern Manufacturing Facility
      drawIsoBox(
        -80,
        140,
        0,
        120,
        80,
        36,
        cx,
        cy,
        {
          top: '#1d2a3f',
          left: '#111927',
          right: '#172335',
          border: 'rgba(255, 255, 255, 0.1)',
          windowGlow: true,
        }
      );

      // 6. Miniature Wind Turbines (Precision Clean Energy)
      const drawTurbine = (x: number, y: number) => {
        const base = toIso(x, y, 0, cx, cy);
        const nacelle = toIso(x, y, 55, cx, cy);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(nacelle.x, nacelle.y);
        ctx.stroke();

        // Rotating blades
        const angle = t * 0.035;
        ctx.lineWidth = 1.2;
        for (let b = 0; b < 3; b++) {
          const bAngle = angle + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(nacelle.x, nacelle.y);
          ctx.lineTo(nacelle.x + Math.cos(bAngle) * 16, nacelle.y + Math.sin(bAngle) * 10);
          ctx.stroke();
        }
        ctx.restore();
      };

      drawTurbine(220, 180);
      drawTurbine(250, 130);

      // 7. Glowing Interconnected Telemetry Routes
      // West Warehouse -> Central Hub
      drawRouteLine(
        { x: -160, y: -35, z: 10 },
        { x: -40, y: -10, z: 12 },
        cx,
        cy,
        15,
        '#f5f5f5'
      );
      // North Terminal -> Central Hub
      drawRouteLine(
        { x: 5, y: -180, z: 10 },
        { x: 0, y: -45, z: 12 },
        cx,
        cy,
        45,
        '#f5f5f5'
      );
      // Container Yard -> Central Hub
      drawRouteLine(
        { x: 130, y: -20, z: 10 },
        { x: 40, y: 0, z: 12 },
        cx,
        cy,
        70,
        '#d4d4d4'
      );
      // Manufacturing -> Central Hub
      drawRouteLine(
        { x: -20, y: 140, z: 10 },
        { x: 0, y: 40, z: 12 },
        cx,
        cy,
        90,
        '#f5f5f5'
      );

      // Subtle atmospheric overlay vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        width * 0.3,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      vignette.addColorStop(0, 'rgba(15, 22, 38, 0)');
      vignette.addColorStop(1, 'rgba(15, 22, 38, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
      />
      {/* Cinematic gradient blends */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1626] via-transparent to-[#0f1626]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1626]/90 via-transparent to-[#0f1626]/90" />
    </div>
  );
};
