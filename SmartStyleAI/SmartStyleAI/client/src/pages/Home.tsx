import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import WeatherCard from "@/components/WeatherCard";
import OutfitCard from "@/components/OutfitCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CameraIcon, SparklesIcon, ShirtIcon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/wardrobe-stats"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const { data: recentOutfits } = useQuery({
    queryKey: ["/api/outfits"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Stylist';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs font-medium text-style-charcoal bg-white">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-3 bg-current rounded-full"></div>
          <div className="w-1 h-3 bg-current rounded-full"></div>
          <div className="w-1 h-3 bg-current rounded-full"></div>
          <div className="w-3 h-2 bg-current rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-style-charcoal">StyleSync</h1>
          <p className="text-sm text-gray-600">Good morning, {displayName}!</p>
        </div>
        <div className="relative">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="Profile" 
            className="w-12 h-12 rounded-full object-cover border-2 border-style-primary"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-style-sage rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* Weather & AI Suggestion */}
      <div className="px-6 mb-6">
        <WeatherCard />
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/wardrobe">
            <Button variant="outline" className="w-full p-4 h-auto flex flex-col items-center space-y-2 border-style-primary text-style-primary hover:bg-style-primary hover:text-white">
              <CameraIcon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">Add Items</div>
                <div className="text-xs opacity-75">Upload new clothes</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/ai-outfits">
            <Button variant="outline" className="w-full p-4 h-auto flex flex-col items-center space-y-2 border-style-accent text-style-accent hover:bg-style-accent hover:text-white">
              <SparklesIcon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">Plan Outfit</div>
                <div className="text-xs opacity-75">AI recommendations</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Outfits */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-style-charcoal">Recent Outfits</h3>
          <Link href="/ai-outfits">
            <Button variant="ghost" className="text-style-primary text-sm font-medium">View All</Button>
          </Link>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {recentOutfits?.slice(0, 3).map((outfit: any) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          )) || (
            <div className="flex-shrink-0 w-32">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                <ShirtIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs font-medium text-style-charcoal">No outfits yet</p>
              <p className="text-xs text-gray-600">Create your first outfit</p>
            </div>
          )}
        </div>
      </div>

      {/* Wardrobe Stats */}
      <div className="px-6 mb-20">
        <h3 className="font-semibold text-lg text-style-charcoal mb-4">Wardrobe Insights</h3>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-style-primary">{stats?.totalItems || 0}</p>
                <p className="text-xs text-gray-600">Total Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-style-accent">{stats?.totalOutfits || 0}</p>
                <p className="text-xs text-gray-600">Outfits Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-style-sage">{stats?.sustainabilityScore || 0}%</p>
                <p className="text-xs text-gray-600">Sustainability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation currentPage="home" />
    </div>
  );
}
