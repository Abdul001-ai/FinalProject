"use client"

import Link from "next/link"
import type { Route } from 'next'
import { usePathname } from "next/navigation"
import { ComponentIcon, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSessionStore } from "@/state/session"
import { cn } from "@/lib/utils"
import { useNavStore } from "@/state/nav"
import { Skeleton } from "@/components/ui/skeleton"
import { SITE_NAME } from "@/constants"

type NavItem = {
  name: string;
  href: Route;
}

const ActionButtons = () => {
  const { session, isLoading } = useSessionStore()
  const { setIsOpen } = useNavStore()

  if (isLoading) {
    return <Skeleton className="h-10 w-[80px] bg-primary" />
  }

  if (session) {
    return null;
  }

  return (
    <Button asChild onClick={() => setIsOpen(false)}>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  )
}

export function Navigation() {
  const { session, isLoading } = useSessionStore()
  const { isOpen, setIsOpen } = useNavStore()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    ...(session ? [
      { name: "Settings", href: "/settings" },
      { name: "Dashboard", href: "/dashboard" },
    ] as NavItem[] : []),
  ]

  const isActiveLink = (itemHref: string) => {
    if (itemHref === "/") {
      return pathname === "/"
    }
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* subtle colorful bottom border */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="group text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
              <span className="relative grid place-items-center overflow-hidden rounded-lg border bg-card/60 p-1.5 shadow-sm">
                <span className="absolute inset-0 -z-10 bg-[conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/.2),transparent_30%,hsl(var(--primary)/.2))] opacity-70 transition-opacity group-hover:opacity-100" />
                <ComponentIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </span>
              <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--foreground))_60%)]">
                {SITE_NAME}
              </span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="flex items-baseline space-x-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-muted-foreground hover:text-foreground no-underline px-3 h-16 flex items-center text-sm font-medium transition-colors relative",
                      isActiveLink(item.href) && "text-foreground after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-primary after:to-transparent"
                    )}
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </div>
            {/* Desktop CTA */}
            {session ? null : (
              <Button asChild className="rounded-full bg-gradient-to-r from-primary to-[hsl(280,70%,55%)] text-white shadow-md">
                <Link href="/sign-up">Get started</Link>
              </Button>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-6">
                  <Menu className="w-9 h-9" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="mt-6 flow-root">
                  <div className="space-y-2">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </>
                    ) : (
                      <>
                        {navItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors relative",
                              isActiveLink(item.href) && "text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                        <div className="px-3 pt-4">
                          {session ? null : (
                            <Button asChild className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(280,70%,55%)] text-white">
                              <Link href="/sign-up">Get started</Link>
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

