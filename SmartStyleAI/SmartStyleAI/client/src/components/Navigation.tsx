import { Link, useLocation } from "wouter";
import { HomeIcon, ShirtIcon, SparklesIcon, LeafIcon, UsersIcon } from "lucide-react";

interface NavigationProps {
  currentPage: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon, href: "/" },
    { id: "wardrobe", label: "Wardrobe", icon: ShirtIcon, href: "/wardrobe" },
    { id: "ai-outfits", label: "AI Style", icon: SparklesIcon, href: "/ai-outfits" },
    { id: "sustainability", label: "Eco", icon: LeafIcon, href: "/sustainability" },
    { id: "community", label: "Community", icon: UsersIcon, href: "/community" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id || (currentPage === "home" && item.id === "home" && location === "/");
          
          return (
            <Link key={item.id} href={item.href}>
              <button className="flex flex-col items-center space-y-1 py-2 transition-colors">
                <IconComponent 
                  className={`w-5 h-5 ${
                    isActive ? "text-style-primary" : "text-gray-400"
                  }`} 
                />
                <span 
                  className={`text-xs font-medium ${
                    isActive ? "text-style-primary" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
