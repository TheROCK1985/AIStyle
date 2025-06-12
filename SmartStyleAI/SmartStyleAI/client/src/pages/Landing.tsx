import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShirtIcon, SparklesIcon, UsersIcon, LeafIcon } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-style-secondary/20 to-style-accent/10 flex flex-col">
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
      <div className="flex items-center justify-center px-6 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <ShirtIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-style-charcoal mb-2">StyleSync</h1>
          <p className="text-gray-600">AI-Powered Wardrobe Assistant</p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-4 space-y-4 flex-1">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-style-primary/10 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-style-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-style-charcoal">AI Styling</h3>
                <p className="text-sm text-gray-600">Get personalized outfit recommendations powered by AI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-style-accent/10 rounded-xl flex items-center justify-center">
                <ShirtIcon className="w-6 h-6 text-style-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-style-charcoal">Smart Wardrobe</h3>
                <p className="text-sm text-gray-600">Organize and track your clothing with intelligent categorization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-style-sage/10 rounded-xl flex items-center justify-center">
                <LeafIcon className="w-6 h-6 text-style-sage" />
              </div>
              <div>
                <h3 className="font-semibold text-style-charcoal">Sustainability</h3>
                <p className="text-sm text-gray-600">Make eco-conscious fashion choices with sustainability insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-style-charcoal">Community</h3>
                <p className="text-sm text-gray-600">Share outfits and get inspiration from other fashion enthusiasts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="px-6 py-8">
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-gradient-primary text-white font-semibold py-4 rounded-xl text-lg"
        >
          Get Started with StyleSync
        </Button>
        <p className="text-center text-xs text-gray-500 mt-4">
          Sign in to access your personalized wardrobe assistant
        </p>
      </div>
    </div>
  );
}
