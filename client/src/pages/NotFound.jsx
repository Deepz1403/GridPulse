
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MainNav } from "@/components/dashboard/Navbar";
import Logo from "@/assets/images/image.png";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen  bg-background text-foreground  flex w-full">
      <MainNav />
      
      <div className="flex-1 pl-0 md:pl-72 w-full transition-all duration-300">
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
          {/* <GridPulseLogo size="large" className="mb-8" /> */}
            <img src={Logo} className="w-[269px] h-[245px]" loading="lazy"/>
          
          <h1 className="text-7xl font-bold text-[#5FB1E8] mb-4">404</h1>
          <p className="text-xl mb-8 max-w-md text-white">The page you're looking for doesn't exist or has been moved.</p>
          
          <Button asChild className="group">
            <a href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;