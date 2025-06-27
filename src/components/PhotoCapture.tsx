
import { Camera, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PhotoCaptureProps {
  onCapture: (photo: string | null) => void;
}

export const PhotoCapture = ({ onCapture }: PhotoCaptureProps) => {
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCapture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex gap-2">
      <label htmlFor="camera" className="flex-1">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <span className="text-sm text-gray-600">Take Photo</span>
        </div>
        <input
          id="camera"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />
      </label>
      
      <label htmlFor="upload" className="flex-1">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <span className="text-sm text-gray-600">Upload</span>
        </div>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoCapture}
          className="hidden"
        />
      </label>
    </div>
  );
};
