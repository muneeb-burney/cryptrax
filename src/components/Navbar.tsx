import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CandlestickChart, Star, LogOut, User as UserIcon, Info, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

function NavItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-3xl px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          {/* Abstract liquid-glass mark */}
          <span className="relative">
            {/* Ambient glow */}
            <span
              aria-hidden="true"
              className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-accent opacity-40 blur-md transition-opacity duration-500 group-hover:opacity-70"
            />
            {/* Glass container */}
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl">
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-primary/25 to-transparent"
              />
              {/* Stylized candlestick mark */}
              <span className="relative flex items-end gap-[3px]">
                <span className="h-3.5 w-[3px] rounded-full bg-white/30" />
                <span className="h-6 w-[3px] rounded-full bg-gradient-to-t from-primary to-accent shadow-[0_0_8px_var(--color-accent)]" />
                <span className="h-4 w-[3px] rounded-full bg-white/30" />
              </span>
              {/* Top refraction line */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </span>
          </span>
          <span className="flex items-baseline text-xl tracking-tight">
            <span className="font-extrabold text-foreground">Crypt</span>
            <span className="font-light text-accent drop-shadow-[0_0_12px_var(--color-accent)]">rax</span>
          </span>
        </Link>


        <div className="flex items-center gap-1 sm:gap-2">
          <NavItem to="/" label="Markets" icon={<CandlestickChart className="h-4 w-4" />} />
          {user && <NavItem to="/watchlist" label="Watchlist" icon={<Star className="h-4 w-4" />} />}
          <NavItem to="/about" label="About" icon={<Info className="h-4 w-4" />} />
          <NavItem to="/settings" label="Settings" icon={<SettingsIcon className="h-4 w-4" />} />

          {loading ? null : user ? (
            <div className="ml-1 flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs text-muted-foreground md:flex">
                <UserIcon className="h-3.5 w-3.5" />
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full border border-glass-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-1 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
