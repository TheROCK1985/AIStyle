import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon, MoreHorizontalIcon } from "lucide-react";

interface SocialPostProps {
  post: {
    id: number;
    caption: string;
    imageUrl?: string;
    tags?: string[];
    likes: number;
    createdAt: string;
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
    isLiked?: boolean;
  };
}

export default function SocialPost({ post }: SocialPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/social/posts/${post.id}/like`, {});
      } else {
        await apiRequest("POST", `/api/social/posts/${post.id}/like`, {});
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
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
        description: "Failed to update like.",
        variant: "destructive",
      });
    },
  });

  const displayName = post.user.firstName || post.user.id.substring(0, 8);

  return (
    <Card className="border-0 shadow-sm rounded-none border-b border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={post.user.profileImageUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-style-charcoal">{displayName}</h4>
            <p className="text-xs text-gray-600">{getTimeAgo(post.createdAt)}</p>
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreHorizontalIcon className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
        
        {post.caption && (
          <p className="text-sm text-style-charcoal mb-3">{post.caption}</p>
        )}
      </CardContent>
      
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post content" 
          className="w-full h-64 object-cover"
        />
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="flex items-center space-x-1 p-0 h-auto"
            >
              <HeartIcon 
                className={`w-5 h-5 ${
                  isLiked ? "text-red-500 fill-current" : "text-gray-600"
                }`} 
              />
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-0 h-auto text-gray-600">
              <MessageCircleIcon className="w-5 h-5" />
              <span className="text-sm">0</span>
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600">
              <ShareIcon className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600">
            <BookmarkIcon className="w-5 h-5" />
          </Button>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
