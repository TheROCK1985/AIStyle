import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditIcon, ShirtIcon } from "lucide-react";

interface WardrobeItemProps {
  item: {
    id: number;
    name: string;
    category: string;
    color?: string;
    brand?: string;
    timesWorn: number;
    isEthical: boolean;
    isSustainable: boolean;
    imageUrl?: string;
  };
}

export default function WardrobeItem({ item }: WardrobeItemProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <ShirtIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm text-style-charcoal truncate">{item.name}</h4>
        {item.brand && (
          <p className="text-xs text-gray-600 truncate">{item.brand}</p>
        )}
        <p className="text-xs text-gray-600 mb-2">Worn {item.timesWorn} times</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                item.category === 'tops' ? 'border-style-primary text-style-primary' :
                item.category === 'bottoms' ? 'border-style-accent text-style-accent' :
                'border-style-sage text-style-sage'
              }`}
            >
              {item.category}
            </Badge>
            {item.isSustainable && (
              <Badge variant="outline" className="text-xs border-style-sage text-style-sage">
                Eco
              </Badge>
            )}
            {item.isEthical && (
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                Ethical
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            <EditIcon className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
