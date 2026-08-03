"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COLOR = "27, 26, 31";
const LINK_COLOR = "171, 125, 47";
const MOUSE_COLOR = "122, 38, 53";
const LINK_DISTANCE = 130;
const MOUSE_DISTANCE = 170;

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container || reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let mouse = { x: -9999, y: -9999 };
    let frameId = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function seedNodes() {
      const density = width < 640 ? 16000 : 11000;
      const count = Math.max(18, Math.min(70, Math.round((width * height) / density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function resize() {
      if (!canvas || !container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function step() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        const dxMouse = a.x - mouse.x;
        const dyMouse = a.y - mouse.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < MOUSE_DISTANCE) {
          ctx!.strokeStyle = `rgba(${MOUSE_COLOR}, ${0.35 * (1 - distMouse / MOUSE_DISTANCE)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            ctx!.strokeStyle = `rgba(${LINK_COLOR}, ${0.22 * (1 - dist / LINK_DISTANCE)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const node of nodes) {
        const dist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        const near = dist < MOUSE_DISTANCE;
        ctx!.fillStyle = near ? `rgba(${MOUSE_COLOR}, 0.55)` : `rgba(${NODE_COLOR}, 0.32)`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, near ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      frameId = requestAnimationFrame(step);
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    function handleMouseLeave() {
      mouse = { x: -9999, y: -9999 };
    }
    function handleVisibility() {
      running = document.visibilityState === "visible";
      if (running) frameId = requestAnimationFrame(step);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    frameId = requestAnimationFrame(step);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className="dot-grid absolute inset-0" aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />;
}
