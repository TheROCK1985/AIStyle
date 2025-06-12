import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SunIcon, CloudIcon, CloudRainIcon } from "lucide-react";
import { Link } from "wouter";

export default function WeatherCard() {
  const { data: weather } = useQuery({
    queryKey: ["/api/weather"],
    retry: false,
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return SunIcon;
      case 'cloudy':
      case 'partly cloudy':
        return CloudIcon;
      case 'rain':
      case 'rainy':
        return CloudRainIcon;
      default:
        return SunIcon;
    }
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : SunIcon;

  return (
    <Card className="bg-gradient-to-r from-style-accent to-style-primary text-white border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <WeatherIcon className="w-5 h-5" />
            <span className="font-medium">
              {weather ? `${weather.condition}, ${weather.temperature}°F` : "Loading weather..."}
            </span>
          </div>
          <span className="text-sm opacity-90">
            {weather?.location || "Your Location"}
          </span>
        </div>
        <h3 className="font-semibold text-lg mb-2">Today's AI Suggestion</h3>
        <p className="text-sm opacity-90 mb-3">
          {weather 
            ? `Perfect weather for a stylish ${weather.temperature > 70 ? 'light' : 'layered'} outfit!`
            : "Get personalized outfit recommendations!"
          }
        </p>
        <Link href="/ai-outfits">
          <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Get Outfit
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
