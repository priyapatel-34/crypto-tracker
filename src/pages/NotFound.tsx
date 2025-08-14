import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-7xl mb-4 animate-bounce">🚀</div>

      <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg mb-4">
        404
      </h1>

      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 text-center">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-700 transition-transform transform hover:scale-105"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
