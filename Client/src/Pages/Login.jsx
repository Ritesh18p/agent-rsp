import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

import Input from "../Components/Input";
import Button from "../Components/Button";
import API from "../Services/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const bubbles = useMemo(() => {
    return Array.from({ length: 65 }, (_, index) => ({
      id: index,
      size: 2 + Math.random() * 7,
      left: Math.random() * 100,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 7,
      drift: -45 + Math.random() * 90,
    }));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/users/login", formData);

      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Login failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-4 text-white">
      <style>{`
        @keyframes authBubble {
          0% {
            transform: translate3d(0, 20px, 0) scale(0.5);
            opacity: 0;
          }

          10% {
            opacity: 0.7;
          }

          50% {
            transform: translate3d(-15px, -50vh, 0) scale(0.9);
            opacity: 0.7;
          }

          100% {
            transform: translate3d(var(--drift), -115vh, 0) scale(1.25);
            opacity: 0;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="absolute bottom-[-20px] rounded-full bg-orange-400/50 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animation: `authBubble ${bubble.duration}s linear infinite`,
              animationDelay: `${bubble.delay}s`,
              "--drift": `${bubble.drift}px`,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-[130px]" />
      </div>

      <Link
        to="/"
        className="absolute left-6 top-6 z-20 text-lg font-bold"
      >
        Agent <span className="text-orange-500">RSP</span>
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800/80 bg-zinc-900/75 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-lg font-black text-white shadow-xl shadow-orange-500/20">
            AR
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Welcome Back
          </h1>

          <p className="mt-2 text-zinc-400">
            Continue with Agent RSP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-orange-400 hover:text-orange-300 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
