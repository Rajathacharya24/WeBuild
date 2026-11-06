import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bookmark,
  ChevronDown,
  LogIn,
  LogOut,
  MapPinned,
  Star,
  UserRound
} from "lucide-react";
import { appConfig } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";

export function Navbar() {
  const { user, initializing, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const firstName = user?.name.split(/\s+/)[0] ?? "Log in";

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${appConfig.name} home`}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#ff6fb5] text-white shadow-glow">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-display font-bold tracking-tight text-ink">
              {appConfig.name}
            </span>
            <span className="hidden text-[11px] font-medium text-muted sm:block">
              {appConfig.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/75 bg-white/75 p-1.5 shadow-card backdrop-blur md:flex">
          {[
            { to: "/", label: "Explore" },
            { to: "/#nearby", label: "Nearby" },
            { to: "/#weekend-plans", label: "Plans" },
            { to: "/#trending", label: "Trending" }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-[#ff6fb5] text-white shadow-sm"
                    : "text-muted hover:bg-primary-tint/60 hover:text-primary-dark"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-white/80 bg-white/85 py-1 pl-1 pr-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-primary/30 hover:text-primary-dark"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary-tint text-primary-dark">
              {user?.avatarUrl ? (
                <SafeImage
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full rounded-full"
                  loading="eager"
                />
              ) : user ? (
                <span className="text-xs font-bold">{getInitials(user.name)}</span>
              ) : (
                <UserRound className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span className="hidden max-w-24 truncate sm:block">
              {initializing ? "…" : firstName}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {open ? (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-3xl border border-white/75 bg-white/90 p-2 shadow-soft backdrop-blur-xl"
            >
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <MenuLink to="/profile" icon={<UserRound className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Profile
                  </MenuLink>
                  <MenuLink
                    to="/profile?tab=ratings"
                    icon={<Star className="h-4 w-4" />}
                    onClick={() => setOpen(false)}
                  >
                    My ratings
                  </MenuLink>
                  <MenuLink
                    to="/profile?tab=plans"
                    icon={<Bookmark className="h-4 w-4" />}
                    onClick={() => setOpen(false)}
                  >
                    Saved plans
                  </MenuLink>
                  <div className="my-1 h-px bg-line" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-primary-tint hover:text-primary-dark"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-ink">Welcome to {appConfig.name}</p>
                    <p className="text-xs text-muted">Sign in to rate and save places.</p>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <MenuLink to="/login" icon={<LogIn className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Log in
                  </MenuLink>
                  <MenuLink to="/signup" icon={<Star className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Create account
                  </MenuLink>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  to,
  icon,
  children,
  onClick
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-primary-tint hover:text-primary-dark"
    >
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      {children}
    </Link>
  );
}
