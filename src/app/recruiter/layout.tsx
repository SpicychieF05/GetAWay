"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Video, LineChart, Settings } from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/recruiter/overview", icon: LayoutDashboard },
    { name: "Initialize", href: "/recruiter/initialize", icon: PlusCircle },
    { name: "Sessions", href: "/recruiter/sessions", icon: Video },
    { name: "Analytics", href: "/recruiter/analytics", icon: LineChart },
    { name: "Settings", href: "/recruiter/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Rail */}
      <aside className="w-64 flex-shrink-0 glass-panel m-4 mr-0 rounded-r-none border-r-0 flex flex-col items-center py-8">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-primary tracking-tight">GetAWay</h1>
          <p className="text-xs text-muted-foreground text-center mt-1">Recruiter Portal</p>
        </div>
        
        <nav className="w-full px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-primary" : ""} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Central Outlet */}
      <main className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="glass-panel h-full w-full p-8 rounded-l-none min-h-[calc(100vh-2rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
