import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";
import ToastMessage from "../components/crpto/ToastMessage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
    id: ""
  });

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToast({ show: true, message, type, id });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      showToast("Login successful!", "success");
      navigate("/");
    } else {
      showToast("Invalid email or password", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          toastId={toast.id}
          visible={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      <div
        className={`bg-white dark:bg-gray-900 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 transition-colors duration-300`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Sign in</h2>
          <p className="mt-2 text-black-300 dark:text-white">
            Welcome back! Please enter your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-black-300 dark:text-white">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition bg-white dark:bg-gray-900`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1  text-black-300 dark:text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full px-4 py-2 rounded-lg border pr-10 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition bg-white dark:bg-gray-900`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
