'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { SearchItem } from './Navbar'
import { FileText, Map } from 'lucide-react'

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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative w-full max-w-xl bg-background border border-border/40 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <Command.Input 
          autoFocus
          placeholder="Search articles, topics..." 
          className="w-full px-4 py-4 bg-transparent text-foreground border-b border-border/40 outline-none placeholder:text-neutral-500"
        />
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="p-4 text-sm text-neutral-400 text-center">
            No results found.
          </Command.Empty>
          
          {Array.from(new Set(searchItems.map(i => i.group))).map(groupName => (
            <Command.Group key={groupName} heading={groupName} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-neutral-500">
              {searchItems.filter(item => item.group === groupName).map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    setOpen(false)
                    router.push(item.url)
                  }}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-foreground rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 aria-selected:bg-black/5 dark:aria-selected:bg-white/10"
                >
                  {groupName === 'Articles' ? (
                    <FileText className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Map className="w-4 h-4 text-neutral-400" />
                  )}
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
