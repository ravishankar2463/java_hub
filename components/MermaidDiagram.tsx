'use client'

import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { createPortal } from 'react-dom';
import { useMounted } from '@/lib/useMounted';

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  const mounted = useMounted();
  const id = `mermaid-${useId().replace(/:/g, '')}`;
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
      fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      themeVariables: {
        background: 'transparent',
        primaryColor: '#059669',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#34d399',
        lineColor: '#6ee7b7',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      }
    });

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Failed to render mermaid diagram', error);
        // Clean up any orphaned error elements
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
      <div className="animate-pulse bg-[var(--color-card)] rounded-2xl h-36 w-full my-6 flex items-center justify-center text-slate-500 text-xs sm:text-sm font-mono border border-[var(--color-border)]">
        Rendering architectural diagram...
      </div>
    );
  }

  return (
    <>
      {/* Inline View */}
      <div className="relative group my-8">
        <div 
          className="p-4 sm:p-8 bg-[#161b22] border border-[var(--color-card-border)] rounded-2xl overflow-x-auto flex justify-center items-center shadow-xs transition-all group-hover:border-emerald-500/50 cursor-pointer min-h-[160px]"
          onClick={() => setIsModalOpen(true)}
          title="Click to expand full interactive diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/* Action Badge Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-md backdrop-blur-sm border border-slate-700 text-xs font-medium cursor-pointer"
          title="Fullscreen Interactive Diagram"
          aria-label="Expand Diagram to Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Expand & Zoom</span>
        </button>
      </div>

      {/* Fullscreen Modal Portal */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="absolute top-4 left-4 right-4 z-[110] flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pan & Zoom enabled • Scroll or pinch</span>
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2.5 bg-slate-900/90 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-2xl border border-slate-700 cursor-pointer"
              aria-label="Close Diagram"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pan & Zoom Canvas */}
          <TransformWrapper
            initialScale={1}
            minScale={0.3}
            maxScale={6}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating Bottom Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-1.5 p-1.5 sm:p-2 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
                  <button 
                    onClick={() => zoomOut()} 
                    className="p-2.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer" 
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="w-px h-5 bg-slate-700 mx-1" />
                  <button 
                    onClick={() => resetTransform()} 
                    className="p-2.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer" 
                    title="Reset View"
                    aria-label="Reset View"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="w-px h-5 bg-slate-700 mx-1" />
                  <button 
                    onClick={() => zoomIn()} 
                    className="p-2.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer" 
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Canvas Container */}
                <TransformComponent
                  wrapperClass="!w-screen !h-screen cursor-grab active:cursor-grabbing"
                  contentClass="w-full h-full flex items-center justify-center p-4 sm:p-12"
                >
                  <div 
                    className="p-8 sm:p-16 bg-[#161b22] border border-slate-700 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-full overflow-hidden"
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
