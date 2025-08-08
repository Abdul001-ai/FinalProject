import { AppSidebar } from "@/components/app-sidebar"
import { getSessionFromCookie } from "@/utils/auth"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import ThemeSwitch from "@/components/theme-switch"
import AccentSwitch from "@/components/accent-switch"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie()

  if (!session) {
    return redirect('/')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-sm text-muted-foreground">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span className="text-foreground">Overview</span>
            </nav>
            {/* Right cluster */}
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:block">
                <Input placeholder="Search..." className="w-[260px]" />
              </div>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeSwitch />
              <AccentSwitch />
              <Avatar className="ml-1 h-8 w-8">
                <AvatarFallback>AZ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
