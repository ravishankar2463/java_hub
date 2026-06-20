'use client'

import { useEffect, useState } from 'react'
import { createHighlighter, Highlighter } from 'shiki'
import { Check, Copy } from 'lucide-react'

let highlighter: Highlighter | null = null

export function CodeBlock({ code, language = 'java' }: { code: string, language?: string }) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function highlight() {
      if (!highlighter) {
        highlighter = await createHighlighter({
          themes: ['github-dark-dimmed'],
          langs: ['java', 'typescript', 'bash', 'json', 'xml', 'powershell', 'sql', 'yaml', 'docker', 'markdown'],
        })
      }
      try {
        const output = highlighter.codeToHtml(code, {
          lang: language,
          theme: 'github-dark-dimmed',
        })
        setHtml(output)
      } catch (e) {
        // Fallback if language is not supported
        const output = highlighter.codeToHtml(code, {
          lang: 'text',
          theme: 'github-dark-dimmed',
        })
        setHtml(output)
      }
    }
    highlight()
  }, [code, language])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden my-6 border border-white/10 bg-[#22272e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-xs font-mono text-neutral-400">{language}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div 
        className="p-4 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!m-0 [&_code]:!grid"
        dangerouslySetInnerHTML={{ __html: html || `<pre><code>${code}</code></pre>` }}
      />
    </div>
  )
}
