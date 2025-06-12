import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import SocialPost from "@/components/SocialPost";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusIcon, UsersIcon } from "lucide-react";

export default function Community() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [caption, setCaption] = useState("");
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

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/social/posts"],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/social/posts", {
        caption,
        tags: caption.match(/#\w+/g) || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      toast({
        title: "Success",
        description: "Post shared successfully!",
      });
      setIsCreatePostOpen(false);
      setCaption("");
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
        description: "Failed to share post.",
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-style-charcoal">Style Community</h1>
          <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-style-primary text-white">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Share Your Style</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    placeholder="Share your outfit inspiration... #fashion #ootd"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => createPostMutation.mutate()}
                  disabled={createPostMutation.isPending || !caption.trim()}
                  className="w-full bg-style-primary text-white"
                >
                  {createPostMutation.isPending ? "Sharing..." : "Share Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Social Feed */}
      <div className="pb-20">
        {postsLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-style-charcoal mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your style!</p>
            <Button 
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-style-primary text-white"
            >
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post: any) => (
              <SocialPost key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <Navigation currentPage="community" />
    </div>
  );
}
