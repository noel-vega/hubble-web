import { Box, Package, LogOut, Menu } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/features/auth/api/postLogout";
import { useNavigate } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const navItems = [
  {
    title: "Projects",
    url: "/projects",
    icon: Package,
  },
  {
    title: "Containers",
    url: "/containers",
    icon: Box,
  },
  {
    title: "Registry",
    url: "/registry",
    icon: Package,
  },
];

interface HeaderProps {
  username?: string;
}

export function Header({ username }: HeaderProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-[#0d1117]">
        {/* Top bar */}
        <div className="flex h-16 items-center px-6 gap-4">
          {/* Sidebar toggle and Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/containers"
              className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
            >
              <span className="text-xl">🔭</span>
              <span className="font-semibold">hubble-web</span>
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {username && (
              <span className="text-sm text-slate-400 hidden sm:block">
                {username}
              </span>
            )}
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">
                {logout.isPending ? "Logging out..." : "Logout"}
              </span>
            </Button>
          </div>
        </div>

        {/* Navigation tabs - no border separator */}
        <div>
          <nav className="flex px-6 -mb-px">
            {navItems.map((item) => {
              const isActive = currentPath === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`
										flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
										${isActive
                      ? "border-orange-500 text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                    }
									`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[400px] bg-white dark:bg-slate-950"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">🔭</span>
              <span>Hubble Navigation</span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Higher-level navigation links will appear here in the future.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
