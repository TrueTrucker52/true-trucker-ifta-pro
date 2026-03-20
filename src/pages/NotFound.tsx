import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <p className="text-6xl">🚛</p>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-primary">Wrong Turn!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like this road doesn't exist. Let's get you back on the highway.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Go Back Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
