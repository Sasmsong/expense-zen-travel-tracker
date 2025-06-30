
import { Camera, Upload, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { parseInvoiceImage, ParsedInvoice } from "@/utils/invoiceParser";
import { useState } from "react";

interface PhotoCaptureProps {
  onCapture: (photo: string | null) => void;
  onInvoiceParsed?: (data: ParsedInvoice) => void;
}

export const PhotoCapture = ({ onCapture, onInvoiceParsed }: PhotoCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
        
        // Start OCR processing
        if (onInvoiceParsed) {
          setIsProcessing(true);
          try {
            console.log('Processing invoice image...');
            const parsedData = await parseInvoiceImage(imageData);
            console.log('Parsed data:', parsedData);
            onInvoiceParsed(parsedData);
          } catch (error) {
            console.error('Failed to parse invoice:', error);
          } finally {
            setIsProcessing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <label htmlFor="camera" className="flex-1">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
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
            disabled={isProcessing}
          />
        </label>
        
        <label htmlFor="upload" className="flex-1">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">Upload</span>
          </div>
          <input
            id="upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoCapture}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing invoice...
        </div>
      )}
    </div>
  );
};
