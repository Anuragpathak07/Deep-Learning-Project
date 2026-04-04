import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, ScanLine } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden md:flex items-center gap-2">
                <div className="w-6 h-6 rounded-md gradient-btn flex items-center justify-center">
                  <ScanLine className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">PlateVision</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </button>
              <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-primary-foreground">
                RK
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}