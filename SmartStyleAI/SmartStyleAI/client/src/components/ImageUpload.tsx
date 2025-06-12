import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraIcon, UploadIcon, XIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelect?: (file: File) => void;
  value?: File | null;
  className?: string;
}

export default function ImageUpload({ onImageSelect, value, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect?.(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect?.(null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {preview ? (
        <Card className="relative overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={clearImage}
            className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-style-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-style-primary/10 rounded-xl flex items-center justify-center mb-3">
              <CameraIcon className="w-6 h-6 text-style-primary" />
            </div>
            <h4 className="font-medium text-style-charcoal mb-1">Add Photo</h4>
            <p className="text-sm text-gray-600 mb-3">
              Drag and drop or click to upload
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <UploadIcon className="w-4 h-4" />
              <span>JPG, PNG up to 5MB</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
