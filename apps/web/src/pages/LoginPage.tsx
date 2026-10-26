import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, KeyRound, MapPinned, Sparkles, Star } from "lucide-react";
import { appConfig } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/States";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, initializing, login, signup } = useAuth();
  const isSignup = location.pathname === "/signup";
  const next =
    typeof (location.state as { next?: unknown } | null)?.next === "string"
      ? ((location.state as { next: string }).next)
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (initializing) {
    return (
      <main id="main-content" className="shell py-16">
        <Spinner label="Checking your session…" />
      </main>
    );
  }

  if (user) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignup) {
      if (name.trim().length < 2) {
        setError("Enter your name.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setPending(true);
    try {
      if (isSignup) {
        await signup({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      navigate(next, { replace: true });
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  function fillDemoAccount() {
    setEmail(appConfig.demoAccount.email);
    setPassword(appConfig.demoAccount.password);
    setError(null);
  }

  return (
    <main id="main-content" className="shell py-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to explore
      </Link>

      <div className="mx-auto mt-5 grid max-w-5xl overflow-hidden rounded-4xl border border-line bg-white shadow-soft lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-primary-dark p-10 text-white lg:flex lg:flex-col">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary-dark">
                <MapPinned className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-bold">{appConfig.name}</p>
                <p className="text-xs text-white/70">{appConfig.tagline}</p>
              </div>
            </div>

            <h2 className="mt-10 text-3xl font-bold leading-tight">
              Your Bangalore, saved in one place.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Sign in to rate the places you visit, save ready-made weekends and keep
              your shortlist synced for the mobile app.
            </p>

            <ul className="mt-8 space-y-4 text-sm">
              {[
                "Discover the closest parks, cafes and heritage spots.",
                "Save weekend plans with realistic time and budgets.",
                "Rate places once and update them whenever you return."
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="text-white/85">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Try the demo
              </div>
              <p className="mt-2 text-sm text-white/85">
                {appConfig.demoAccount.email}
                <span className="mx-1.5 text-white/40">/</span>
                {appConfig.demoAccount.password}
              </p>
            </div>
          </div>

          <p className="relative mt-auto pt-10 text-xs text-white/60">
            One API, one codebase, ready for the React Native app.
          </p>
        </aside>

        <section className="p-6 sm:p-10">
          <div className="flex rounded-full bg-primary-tint p-1" role="tablist" aria-label="Account action">
            <Link
              to="/login"
              state={{ next }}
              role="tab"
              aria-selected={!isSignup}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                !isSignup
                  ? "bg-white text-primary-dark shadow-sm"
                  : "text-primary-dark/70 hover:text-primary-dark"
              )}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              state={{ next }}
              role="tab"
              aria-selected={isSignup}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                isSignup
                  ? "bg-white text-primary-dark shadow-sm"
                  : "text-primary-dark/70 hover:text-primary-dark"
              )}
            >
              Sign up
            </Link>
          </div>

          <div className="mt-7">
            <p className="eyebrow">{isSignup ? "New explorer" : "Welcome back"}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {isSignup ? "Create your account" : "Log in to WeBuild"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {isSignup
                ? "Use an email and password for now. Google and OTP login can be added behind the same interface."
                : "Pick up where you left off with your ratings, saved plans and places."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup ? (
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-ink">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={60}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/80 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-ink">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/80 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-semibold text-ink">
                  Password
                </label>
                {!isSignup ? (
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="text-xs font-semibold text-primary-dark hover:underline"
                  >
                    Use demo account
                  </button>
                ) : null}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={isSignup ? 8 : 1}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignup ? "At least 8 characters" : "Your password"}
                className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/80 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error ? (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth size="lg" loading={pending}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {isSignup ? "Create account" : "Log in"}
            </Button>
          </form>

          {!isSignup ? (
            <div className="mt-4 rounded-2xl bg-primary-tint/60 p-3 text-center text-xs text-primary-dark">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                Demo: {appConfig.demoAccount.email} / {appConfig.demoAccount.password}
              </span>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
