import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LeafIcon, RecycleIcon, RepeatIcon, HeartIcon } from "lucide-react";

export default function Sustainability() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: analysis } = useQuery({
    queryKey: ["/api/sustainability/analysis"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/sustainability/brands"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/wardrobe-stats"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const ecoScore = stats?.sustainabilityScore || analysis?.score || 85;

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
        <h1 className="text-xl font-bold text-style-charcoal mb-2">Sustainable Fashion</h1>
        <p className="text-sm text-gray-600">Make eco-conscious fashion choices</p>
      </div>

      {/* Sustainability Score */}
      <div className="px-6 py-4">
        <Card className="bg-gradient-to-r from-style-sage to-green-600 text-white border-0 shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Your Eco Score</h3>
              <LeafIcon className="w-8 h-8" />
            </div>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-3xl font-bold">{ecoScore}</span>
              <span className="text-lg opacity-90">/ 100</span>
            </div>
            <p className="text-sm opacity-90">
              {ecoScore >= 80 ? "Excellent! You're making great sustainable choices." 
               : ecoScore >= 60 ? "Good job! Keep improving your sustainability."
               : "There's room for improvement in your sustainability choices."}
            </p>
            <div className="mt-3">
              <Progress value={ecoScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Analysis */}
      {analysis && (
        <div className="px-6 py-4">
          <h3 className="font-semibold text-style-charcoal mb-4">Sustainability Insights</h3>
          
          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-style-charcoal mb-3 flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <LeafIcon className="w-4 h-4 text-green-600" />
                  </div>
                  Strengths
                </h4>
                <div className="space-y-2">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {strength}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-style-charcoal mb-3">Improvement Recommendations</h4>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border-l-2 border-style-accent pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-style-charcoal">{rec.action}</h5>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{rec.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Eco-Friendly Brands */}
      <div className="px-6 py-4">
        <h3 className="font-semibold text-style-charcoal mb-4">Recommended Eco Brands</h3>
        
        <div className="space-y-3">
          {/* Mock sustainable brands since we don't have seeded data */}
          {[
            {
              name: "Reformation",
              description: "Sustainable women's clothing",
              certifications: ["Carbon Neutral", "Fair Trade"],
              sustainabilityScore: 95
            },
            {
              name: "Patagonia", 
              description: "Outdoor wear & activism",
              certifications: ["Organic", "B-Corp"],
              sustainabilityScore: 92
            },
            {
              name: "Everlane",
              description: "Radical transparency",
              certifications: ["Transparent", "Ethical"],
              sustainabilityScore: 88
            }
          ].map((brand, index) => (
            <Card key={index} className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-style-sage/10 rounded-lg flex items-center justify-center">
                    <LeafIcon className="w-6 h-6 text-style-sage" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-style-charcoal">{brand.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{brand.description}</p>
                    <div className="flex items-center space-x-2">
                      {brand.certifications.map((cert, certIndex) => (
                        <Badge key={certIndex} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-style-primary">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sustainability Tips */}
      <div className="px-6 py-4 pb-20">
        <h3 className="font-semibold text-style-charcoal mb-4">Eco Tips</h3>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-style-sage/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RecycleIcon className="w-4 h-4 text-style-sage" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-style-charcoal">Wear items 30+ times</h4>
                  <p className="text-xs text-gray-600">Maximize cost per wear and reduce waste</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-style-sage/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RepeatIcon className="w-4 h-4 text-style-sage" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-style-charcoal">Try clothing swaps</h4>
                  <p className="text-xs text-gray-600">Refresh your wardrobe sustainably</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-style-sage/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HeartIcon className="w-4 h-4 text-style-sage" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-style-charcoal">Care for your clothes</h4>
                  <p className="text-xs text-gray-600">Proper care extends garment lifespan</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation currentPage="sustainability" />
    </div>
  );
}
