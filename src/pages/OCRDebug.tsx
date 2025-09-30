import { useState } from "react";
import { PhotoCapture } from "@/components/PhotoCapture";
import { ParsedInvoice } from "@/utils/invoiceParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

const OCRDebug = () => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedInvoice | null>(null);

  const handleDownloadSample = (sampleName: string) => {
    const samples = {
      'receipt1': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'receipt2': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };
    
    const link = document.createElement('a');
    link.href = samples[sampleName as keyof typeof samples] || samples.receipt1;
    link.download = `${sampleName}-sample.png`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">OCR Debug Tool</h1>
        <p className="text-muted-foreground mt-2">
          Test OCR functionality with sample images or upload your own receipts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test OCR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhotoCapture 
              onCapture={setCapturedPhoto}
              onInvoiceParsed={setParsedData}
            />
            
            <div className="space-y-2">
              <h4 className="font-medium">Sample Images:</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSample('receipt1')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Receipt 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSample('receipt2')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Receipt 2
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>OCR Results</CardTitle>
          </CardHeader>
          <CardContent>
            {parsedData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Merchant</label>
                    <p className="text-sm">
                      {parsedData.merchant || <span className="text-muted-foreground">Not detected</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                    <p className="text-sm">
                      {parsedData.total ? `$${parsedData.total}` : <span className="text-muted-foreground">Not detected</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-sm">
                      {parsedData.date || <span className="text-muted-foreground">Not detected</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">
                      {parsedData.category ? (
                        <Badge variant="secondary">{parsedData.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not detected</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {parsedData.rawText && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Raw OCR Text</label>
                    <div className="mt-2 p-3 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {parsedData.rawText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Upload an image to see OCR results
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Captured Image Preview */}
      {capturedPhoto && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Captured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={capturedPhoto} 
              alt="Captured receipt" 
              className="max-w-full h-auto max-h-96 object-contain border rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Debug Console */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>Console Logs:</strong> Open browser developer tools (F12) to see detailed OCR logs</p>
            <p><strong>Local OCR:</strong> Uses Tesseract.js for client-side processing</p>
            <p><strong>Cloud OCR:</strong> Uses Lovable AI (Gemini Vision) for more accurate extraction</p>
            <p><strong>Fallback:</strong> If Cloud OCR fails, automatically falls back to local OCR</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Check the browser console for detailed processing logs including OCR progress, 
            image preprocessing steps, and parsing results.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRDebug;