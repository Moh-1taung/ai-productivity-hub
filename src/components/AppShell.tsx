import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/70 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              AI Workplace Productivity Assistant
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <footer className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            AI-generated content may require human review.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl [background:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
