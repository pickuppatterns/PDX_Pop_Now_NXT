'use client'
import React, { useState, useRef, useEffect } from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon, MenuIcon, XIcon, ChevronDownIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-1 items-center" ref={dropdownRef}>
        {navItems.map(({ link, subItems }, i) => {
          const hasDropdown = subItems && (subItems as any[]).length > 0
          return (
            <div key={i} className="relative">
              {hasDropdown ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="flex items-center gap-1 px-3 py-2 text-base font-medium text-gray-900 [text-shadow:0_1px_3px_rgba(255,255,255,0.8)] hover:opacity-70 transition-opacity"
                >
                  {link.label}
                  <ChevronDownIcon
                    className={`w-3 h-3 transition-transform ${openDropdown === i ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <div className="px-1">
                  <CMSLink
                    {...link}
                    appearance="link"
                    className="text-base font-medium text-gray-900 [text-shadow:0_1px_3px_rgba(255,255,255,0.8)] hover:opacity-70"
                  />
                </div>
              )}
              {/* Dropdown */}
              {hasDropdown && openDropdown === i && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-black border border-white/10 rounded shadow-lg z-50 py-1">
                  {(subItems as any[]).map((sub, j) => (
                    <div
                      key={j}
                      className="px-4 py-2 hover:bg-white/10 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <CMSLink {...sub.link} appearance="link" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <Link href="/search" className="px-2">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-primary" />
        </Link>
      </nav>

      {/* Mobile controls */}
      <div className="flex md:hidden items-center gap-3">
        <Link href="/search">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-primary" />
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" className="p-1">
          {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-black border-t border-white/10 px-6 py-6 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          {navItems.map(({ link, subItems }, i) => {
            const hasDropdown = subItems && (subItems as any[]).length > 0
            return (
              <div key={i}>
                <div
                  className="flex items-center justify-between py-2 border-b border-white/10"
                  onClick={() => {
                    if (!hasDropdown) setMobileOpen(false)
                    else setOpenDropdown(openDropdown === i ? null : i)
                  }}
                >
                  <CMSLink {...link} appearance="link" />
                  {hasDropdown && (
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${openDropdown === i ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
                {hasDropdown && openDropdown === i && (
                  <div className="pl-4 flex flex-col gap-1 mt-1 mb-2">
                    {(subItems as any[]).map((sub, j) => (
                      <div key={j} className="py-1" onClick={() => setMobileOpen(false)}>
                        <CMSLink {...sub.link} appearance="link" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
