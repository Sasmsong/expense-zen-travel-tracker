
import { Camera, Upload, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { parseInvoiceImage, ParsedInvoice } from "@/utils/invoiceParser";
import { FileValidator, SecurityMonitor } from "@/utils/security";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PhotoCaptureProps {
  onCapture: (photo: string | null) => void;
  onInvoiceParsed?: (data: ParsedInvoice) => void;
}

export const PhotoCapture = ({ onCapture, onInvoiceParsed }: PhotoCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Rate limiting for OCR processing
    if (!SecurityMonitor.checkRateLimit('ocr_processing')) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before processing another image.",
        variant: "destructive"
      });
      return;
    }

    // Security: Validate file type and size
    const validation = FileValidator.validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      SecurityMonitor.logSecurityEvent('invalid_file_upload', { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      
      // Security: Validate base64 image data
      if (!FileValidator.validateBase64Image(imageData)) {
        toast({
          title: "Invalid image",
          description: "The uploaded file is not a valid image.",
          variant: "destructive"
        });
        SecurityMonitor.logSecurityEvent('invalid_image_data');
        return;
      }

      onCapture(imageData);
      
      // Start OCR processing
      if (onInvoiceParsed) {
        console.log('onInvoiceParsed callback provided, starting OCR...');
        setIsProcessing(true);
        try {
          console.log('Processing invoice image...');
          const parsedData = await parseInvoiceImage(imageData);
          console.log('Parsed data:', parsedData);
          onInvoiceParsed(parsedData);
        } catch (error) {
          console.error('Failed to parse invoice:', error);
          SecurityMonitor.logSecurityEvent('ocr_processing_error', { error: error?.toString() });
          toast({
            title: "Processing failed",
            description: "Failed to extract data from the image. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };

    reader.onerror = () => {
      SecurityMonitor.logSecurityEvent('file_read_error', { fileName: file.name });
      toast({
        title: "File error",
        description: "Failed to read the selected file.",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
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
