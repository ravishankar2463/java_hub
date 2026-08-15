'use client'

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { createPortal } from 'react-dom';

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  // Use a stable, unique ID for mermaid to render into
  const [id] = useState(`mermaid-${Math.random().toString(36).substring(7)}`);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      themeVariables: {
        background: 'transparent',
        primaryColor: '#059669',
        primaryTextColor: '#fff',
        primaryBorderColor: '#34d399',
        lineColor: '#6ee7b7',
        secondaryColor: '#1f2937',
        tertiaryColor: '#111827',
      }
    });

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Failed to render mermaid diagram', error);
        // During dev HMR, Mermaid leaves orphaned error SVGs in the body. Clean them up!
        const errorElement = document.getElementById('d' + id);
        if (errorElement) {
            errorElement.remove();
        }
      }
    };

    renderDiagram();
  }, [chart, id]);

  if (!svg) {
    return (
      <div className="animate-pulse bg-white/5 rounded-xl h-32 w-full my-6 flex items-center justify-center text-neutral-500 text-sm font-mono border border-white/10">
        Rendering architectural diagram...
      </div>
    );
  }

  return (
    <>
      {/* Inline View */}
      <div className="relative group my-8">
        <div 
          className="p-6 bg-black border border-white/10 rounded-xl overflow-x-auto flex justify-center items-center shadow-lg transition-colors group-hover:border-emerald-500/50 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {/* Hover Overlay Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 right-4 p-2 bg-neutral-900/80 hover:bg-emerald-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm border border-white/10"
          title="Fullscreen Diagram"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen Portal */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Close Button */}
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 z-[110] p-3 bg-neutral-800 hover:bg-red-600 text-white rounded-xl transition-colors shadow-2xl border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pan & Zoom Engine */}
          <TransformWrapper
            initialScale={1}
            minScale={0.2}
            maxScale={8}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 p-2 bg-neutral-900/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
                  <button onClick={() => zoomOut()} className="p-3 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors" title="Zoom Out">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button onClick={() => resetTransform()} className="p-3 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors" title="Reset View">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button onClick={() => zoomIn()} className="p-3 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors" title="Zoom In">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                {/* Transform Canvas */}
                <TransformComponent wrapperClass="!w-screen !h-screen cursor-grab active:cursor-grabbing" contentClass="w-full h-full flex items-center justify-center">
                  <div 
                    className="p-16 bg-black/80 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)]"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>,
        document.body
      )}
    </>
  );
}
