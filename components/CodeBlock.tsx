'use client'

import { useEffect, useState } from 'react'
import { createHighlighter, Highlighter } from 'shiki'
import { Check, Copy, Code2 } from 'lucide-react'

let highlighter: Highlighter | null = null

const LANGUAGE_MAP: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  docker: 'dockerfile',
  golang: 'go',
  js: 'javascript',
  ts: 'typescript',
};

export function CodeBlock({
  code,
  language = 'java',
}: {
  code: string;
  language?: string;
}) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const normalizedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase()

  useEffect(() => {
    let isCancelled = false

    async function highlight() {
      if (!highlighter) {
        highlighter = await createHighlighter({
          themes: ['github-dark-dimmed'],
          langs: [
            'java',
            'typescript',
            'javascript',
            'bash',
            'json',
            'xml',
            'powershell',
            'sql',
            'yaml',
            'dockerfile',
            'markdown',
            'diff',
          ],
        })
      }

      if (isCancelled) return

      try {
        const output = highlighter.codeToHtml(code, {
          lang: normalizedLang,
          theme: 'github-dark-dimmed',
        })
        if (!isCancelled) setHtml(output)
      } catch {
        // Fallback to markdown if language isn't supported
        try {
          const output = highlighter.codeToHtml(code, {
            lang: 'markdown',
            theme: 'github-dark-dimmed',
          })
          if (!isCancelled) setHtml(output)
        } catch {
          if (!isCancelled) setHtml('')
        }
      }
    }

    highlight()

    return () => {
      isCancelled = true
    }
  }, [code, normalizedLang])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
    }
  }

  const lineCount = code.split('\n').length

  return (
    <div className="relative group rounded-xl overflow-hidden my-6 border border-[var(--color-card-border)] bg-[#1c2128] shadow-sm max-w-full">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30 backdrop-blur-sm select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
            {language}
          </span>
          {lineCount > 1 && (
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
              ({lineCount} lines)
            </span>
          )}
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[32px] text-xs font-medium"
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed [&_pre]:!bg-transparent [&_pre]:!m-0 [&_code]:!grid scrollbar-thin">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-slate-200">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
