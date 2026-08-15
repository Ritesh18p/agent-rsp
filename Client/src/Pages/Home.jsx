import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const messages = useMemo(
    () => [
      "Your ideas deserve more than a place to sit.",
      "Tell Agent RSP what you need. Let it do the work.",
    ],
    []
  );

  const [messageIndex, setMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = messages[messageIndex];

    const speed = deleting ? 35 : 65;

    const timer = setTimeout(() => {
      if (!deleting) {
        const nextText = currentMessage.slice(
          0,
          displayText.length + 1
        );

        setDisplayText(nextText);

        if (nextText === currentMessage) {
          setTimeout(() => setDeleting(true), 1600);
        }
      } else {
        const nextText = currentMessage.slice(
          0,
          displayText.length - 1
        );

        setDisplayText(nextText);

        if (nextText.length === 0) {
          setDeleting(false);
          setMessageIndex(
            (prev) => (prev + 1) % messages.length
          );
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, deleting, messageIndex, messages]);

  const bubbles = useMemo(() => {
    return Array.from({ length: 85 }, (_, index) => ({
      id: index,
      size: 2 + Math.random() * 7,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * 8,
      drift: -40 + Math.random() * 80,
    }));
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-6 text-white">
      <style>{`
        @keyframes bottleBubble {
          0% {
            transform: translate3d(0, 30px, 0) scale(0.55);
            opacity: 0;
          }

          8% {
            opacity: 0.65;
          }

          45% {
            transform: translate3d(-12px, -45vh, 0) scale(0.9);
            opacity: 0.75;
          }

          70% {
            transform: translate3d(18px, -75vh, 0) scale(1.05);
            opacity: 0.6;
          }

          100% {
            transform: translate3d(var(--drift), -115vh, 0) scale(1.3);
            opacity: 0;
          }
        }

        @keyframes centerGlow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.22;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 0.4;
          }
        }

        @keyframes cursorBlink {
          0%, 45% {
            opacity: 1;
          }

          46%, 100% {
            opacity: 0;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .landing-fade-up {
          animation: fadeUp 0.9s ease-out both;
        }
      `}</style>

      {/* Rising bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="absolute bottom-[-20px] rounded-full bg-orange-400/50 shadow-[0_0_10px_rgba(249,115,22,0.45)]"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animation: `bottleBubble ${bubble.duration}s linear infinite`,
              animationDelay: `${bubble.delay}s`,
              "--drift": `${bubble.drift}px`,
            }}
          />
        ))}

        <div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] rounded-full bg-orange-600/10 blur-[140px]"
          style={{
            animation: "centerGlow 6s ease-in-out infinite",
          }}
        />

        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-orange-600/10 blur-[120px]" />

        <div className="absolute -right-40 bottom-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-white"
          >
            Agent <span className="text-orange-500">RSP</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div className="landing-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
          Personal Intelligence
        </div>

        <h1 className="landing-fade-up text-6xl font-black tracking-[-0.05em] sm:text-7xl lg:text-8xl">
          Agent <span className="text-orange-500">RSP</span>
        </h1>

        <div className="mt-8 min-h-[105px] max-w-3xl">
          <p className="text-2xl font-medium leading-relaxed text-zinc-200 sm:text-3xl">
            {displayText}
            <span
              className="ml-1 inline-block h-8 w-px bg-orange-500 align-middle sm:h-9"
              style={{
                animation: "cursorBlink 0.9s infinite",
              }}
            />
          </p>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
          One intelligent interface for your information,
          ideas, decisions, and everyday tasks.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/login"
            className="rounded-2xl border border-zinc-700 bg-zinc-900/80 px-10 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-1 hover:border-orange-500/50 hover:bg-zinc-800"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-10 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:from-orange-600 hover:to-amber-700"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-3 text-xs text-zinc-600">
          <span className="h-px w-10 bg-zinc-800" />
          <span>Think it. Tell Agent RSP. Get it done.</span>
          <span className="h-px w-10 bg-zinc-800" />
        </div>
      </section>
    </main>
  );
}

export default Home;