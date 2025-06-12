import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCwIcon, BriefcaseIcon, CoffeeIcon, HeartIcon, PartyPopperIcon, StarIcon, SaveIcon, ShareIcon } from "lucide-react";

const occasions = [
  { id: "work", label: "Work", icon: BriefcaseIcon },
  { id: "casual", label: "Casual", icon: CoffeeIcon },
  { id: "date", label: "Date", icon: HeartIcon },
  { id: "party", label: "Party", icon: PartyPopperIcon },
];

export default function AIOutfits() {
  const [selectedOccasion, setSelectedOccasion] = useState("work");
  const [recommendation, setRecommendation] = useState<any>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
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

  const { data: weather } = useQuery({
    queryKey: ["/api/weather"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const generateRecommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/outfit-recommendation", {
        occasion: selectedOccasion,
        weather: weather ? `${weather.condition}, ${weather.temperature}°F` : undefined,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendation(data);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to generate outfit recommendation.",
        variant: "destructive",
      });
    },
  });

  const saveOutfitMutation = useMutation({
    mutationFn: async () => {
      if (!recommendation) return;
      
      await apiRequest("POST", "/api/outfits", {
        name: recommendation.name,
        occasion: selectedOccasion,
        weather: weather ? `${weather.condition}, ${weather.temperature}°F` : undefined,
        items: recommendation.items,
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      toast({
        title: "Success",
        description: "Outfit saved successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save outfit.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-style-charcoal mb-2">AI Outfit Planner</h1>
        <p className="text-sm text-gray-600">Let AI create the perfect look for you</p>
      </div>

      {/* Occasion Selector */}
      <div className="px-6 py-4">
        <h3 className="font-semibold text-style-charcoal mb-3">What's the occasion?</h3>
        <div className="grid grid-cols-2 gap-3">
          {occasions.map((occasion) => {
            const IconComponent = occasion.icon;
            const isSelected = selectedOccasion === occasion.id;
            return (
              <Button
                key={occasion.id}
                variant="outline"
                onClick={() => setSelectedOccasion(occasion.id)}
                className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                  isSelected 
                    ? "border-style-primary border-2 bg-style-primary/5" 
                    : "border-gray-200"
                }`}
              >
                <IconComponent className={`w-6 h-6 ${isSelected ? "text-style-primary" : "text-gray-600"}`} />
                <span className={`text-sm font-medium ${isSelected ? "text-style-primary" : "text-style-charcoal"}`}>
                  {occasion.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="px-6 py-4">
        <Button
          onClick={() => generateRecommendationMutation.mutate()}
          disabled={generateRecommendationMutation.isPending}
          className="w-full bg-gradient-primary text-white py-3 rounded-xl font-medium"
        >
          {generateRecommendationMutation.isPending ? "Generating..." : "Generate AI Recommendation"}
        </Button>
      </div>

      {/* AI Recommendations */}
      {recommendation && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-style-charcoal">AI Recommendation</h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => generateRecommendationMutation.mutate()}
              disabled={generateRecommendationMutation.isPending}
              className="text-style-primary"
            >
              <RefreshCwIcon className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Main Recommendation */}
          <Card className="shadow-sm border-0 overflow-hidden mb-4">
            <div className="flex">
              <div className="w-32 h-40 bg-gray-200 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs text-gray-600 mb-1">AI Generated</div>
                  <div className="text-xs font-medium text-style-charcoal">{recommendation.name}</div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-style-charcoal">{recommendation.name}</h4>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-style-charcoal">{(recommendation.confidence / 20).toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{recommendation.reasoning}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.occasion}
                    </Badge>
                    {recommendation.weatherSuitability && (
                      <Badge variant="outline" className="text-xs">
                        Weather-Appropriate
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Style Notes */}
          {recommendation.styleNotes && recommendation.styleNotes.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-style-charcoal mb-3">Styling Tips</h4>
                <ul className="space-y-2">
                  {recommendation.styleNotes.map((note: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 bg-style-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alternative Options */}
          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-style-charcoal mb-3">Alternative Options</h4>
                <div className="flex space-x-3 overflow-x-auto">
                  {recommendation.alternatives.map((alt: any, index: number) => (
                    <div key={index} className="flex-shrink-0 w-24">
                      <div className="w-full h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                        <div className="text-center p-1">
                          <div className="text-xs font-medium text-style-charcoal">{alt.name}</div>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-style-charcoal">{alt.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={() => saveOutfitMutation.mutate()}
              disabled={saveOutfitMutation.isPending}
              className="flex-1 bg-style-primary text-white py-3 rounded-xl font-medium"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {saveOutfitMutation.isPending ? "Saving..." : "Save Outfit"}
            </Button>
            <Button 
              variant="outline"
              className="flex-1 py-3 rounded-xl font-medium border-style-accent text-style-accent"
            >
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}

      <div className="h-20"></div>
      <Navigation currentPage="ai-outfits" />
    </div>
  );
}
