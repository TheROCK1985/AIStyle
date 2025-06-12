import { Card } from "@/components/ui/card";
import { ShirtIcon } from "lucide-react";

interface OutfitCardProps {
  outfit: {
    id: number;
    name: string;
    occasion: string;
    createdAt: string;
  };
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours < 1 ? "Just now" : `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="flex-shrink-0 w-32">
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <div className="text-center p-2">
            <ShirtIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-xs font-medium text-style-charcoal truncate">{outfit.name}</div>
          </div>
        </div>
      </Card>
      <div className="mt-2">
        <p className="text-xs font-medium text-style-charcoal truncate">{outfit.name}</p>
        <p className="text-xs text-gray-600">{getTimeAgo(outfit.createdAt)}</p>
      </div>
    </div>
  );
}
