'use client'

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  // Use a stable, unique ID for mermaid to render into
  const [id] = useState(`mermaid-${Math.random().toString(36).substring(7)}`);

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
    <div 
      className="my-8 p-6 bg-black border border-white/10 rounded-xl overflow-x-auto flex justify-center items-center shadow-lg"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
