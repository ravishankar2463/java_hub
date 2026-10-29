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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative w-full max-w-xl bg-background border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <div className="flex items-center px-4 border-b border-black/10 dark:border-white/10">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <Command.Input 
            autoFocus
            placeholder="Search lessons, topics, patterns..." 
            className="w-full px-3 py-4 bg-transparent text-foreground outline-none placeholder:text-neutral-500 text-sm sm:text-base"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Command.List className="max-h-[50vh] sm:max-h-[320px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="p-6 text-sm text-neutral-400 text-center">
            No matching topics or articles found.
          </Command.Empty>
          
          {Array.from(new Set(searchItems.map(i => i.group))).map(groupName => (
            <Command.Group 
              key={groupName} 
              heading={groupName} 
              className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-neutral-400"
            >
              {searchItems.filter(item => item.group === groupName).map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    setOpen(false)
                    router.push(item.url)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-500 aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 transition-colors"
                >
                  {groupName === 'Articles' ? (
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Map className="w-4 h-4 text-emerald-500 shrink-0" />
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
