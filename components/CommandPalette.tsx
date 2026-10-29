'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { SearchItem } from './Navbar'
import { FileText, Map, Search, X } from 'lucide-react'

export function CommandPalette({
  open,
  setOpen,
  searchItems,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  searchItems: SearchItem[]
}) {
  const router = useRouter()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:pt-[15vh]">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative w-full max-w-xl bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <div className="flex items-center px-4 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <Command.Input 
            autoFocus
            placeholder="Search lessons, topics, patterns..." 
            className="w-full px-3 py-4 bg-transparent text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 text-sm sm:text-base"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[var(--color-card-subtle)] transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Command.List className="max-h-[50vh] sm:max-h-[320px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="p-6 text-sm text-slate-500 text-center">
            No matching topics or articles found.
          </Command.Empty>
          
          {Array.from(new Set(searchItems.map(i => i.group))).map(groupName => (
            <Command.Group 
              key={groupName} 
              heading={groupName} 
              className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400 dark:[&_[cmdk-group-heading]]:text-slate-500"
            >
              {searchItems.filter(item => item.group === groupName).map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    setOpen(false)
                    router.push(item.url)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 aria-selected:bg-emerald-500/10 aria-selected:text-emerald-700 dark:aria-selected:text-emerald-400 transition-colors"
                >
                  {groupName === 'Articles' ? (
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
