import { useState } from "react";
import { PhotoCapture } from "@/components/PhotoCapture";
import { ParsedInvoice } from "@/utils/invoiceParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CloudCog, Cpu, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

const OCRDebug = () => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedInvoice | null>(null);
  const [cloudResult, setCloudResult] = useState<any>(null);
  const [localResult, setLocalResult] = useState<any>(null);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isTestingLocal, setIsTestingLocal] = useState(false);
  const [isCheckingConnectivity, setIsCheckingConnectivity] = useState(false);

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

  const testCloudOCR = async () => {
    if (!capturedPhoto) {
      toast({ title: "No image", description: "Please upload an image first" });
      return;
    }
    
    setIsTestingCloud(true);
    setCloudResult(null);
    
    try {
      console.log('[OCR Debug] Testing Cloud OCR...');
      const { data, error } = await supabase.functions.invoke('receipt-extract', {
        body: { imageData: capturedPhoto }
      });
      
      if (error) {
        console.error('[OCR Debug] Cloud OCR error:', error);
        setCloudResult({ 
          success: false, 
          error: error.message,
          statusCode: error.message?.includes('429') ? 429 : error.message?.includes('402') ? 402 : 500
        });
        toast({ 
          title: "Cloud OCR Failed", 
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('[OCR Debug] Cloud OCR success:', data);
        setCloudResult({ success: true, data });
        toast({ title: "Cloud OCR Success", description: "Invoice parsed successfully" });
      }
    } catch (err: any) {
      console.error('[OCR Debug] Cloud OCR exception:', err);
      setCloudResult({ success: false, error: err.message });
      toast({ title: "Cloud OCR Error", description: err.message, variant: "destructive" });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const testLocalOCR = async () => {
    if (!capturedPhoto) {
      toast({ title: "No image", description: "Please upload an image first" });
      return;
    }
    
    setIsTestingLocal(true);
    setLocalResult(null);
    
    try {
      console.log('[OCR Debug] Testing Local OCR...');
      const { data: { text } } = await Tesseract.recognize(capturedPhoto, 'eng', {
        logger: (m: any) => console.log(`[OCR Debug] ${m.status}: ${Math.round(m.progress * 100)}%`),
        workerPath: 'https://unpkg.com/tesseract.js@6.0.1/dist/worker.min.js',
        corePath: 'https://unpkg.com/tesseract.js-core@6.0.0/tesseract-core.wasm.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        tessedit_pageseg_mode: 6 as any,
      } as any);
      
      console.log('[OCR Debug] Local OCR text:', text);
      setLocalResult({ success: true, text, length: text.length });
      toast({ title: "Local OCR Success", description: `Extracted ${text.length} characters` });
    } catch (err: any) {
      console.error('[OCR Debug] Local OCR error:', err);
      setLocalResult({ success: false, error: err.message });
      toast({ title: "Local OCR Error", description: err.message, variant: "destructive" });
    } finally {
      setIsTestingLocal(false);
    }
  };

  const checkConnectivity = async () => {
    setIsCheckingConnectivity(true);
    try {
      console.log('[OCR Debug] Checking connectivity...');
      const { error } = await supabase.functions.invoke('receipt-extract', {
        body: { imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }
      });
      
      if (error) {
        toast({ 
          title: "Connectivity Check", 
          description: `Function reachable but returned error: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({ title: "Connectivity OK", description: "Edge function is reachable" });
      }
    } catch (err: any) {
      toast({ 
        title: "Connectivity Failed", 
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsCheckingConnectivity(false);
    }
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

      {/* Diagnostics Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            OCR Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={testCloudOCR}
              disabled={!capturedPhoto || isTestingCloud}
              size="sm"
            >
              <CloudCog className="w-4 h-4 mr-2" />
              {isTestingCloud ? 'Testing...' : 'Test Cloud OCR'}
            </Button>
            <Button
              onClick={testLocalOCR}
              disabled={!capturedPhoto || isTestingLocal}
              variant="secondary"
              size="sm"
            >
              <Cpu className="w-4 h-4 mr-2" />
              {isTestingLocal ? 'Testing...' : 'Test Local OCR'}
            </Button>
            <Button
              onClick={checkConnectivity}
              disabled={isCheckingConnectivity}
              variant="outline"
              size="sm"
            >
              {isCheckingConnectivity ? 'Checking...' : 'Check Connectivity'}
            </Button>
          </div>
          
          {cloudResult && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Cloud OCR Result:</h4>
              {cloudResult.success ? (
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(cloudResult.data, null, 2)}</pre>
              ) : (
                <p className="text-destructive">Error {cloudResult.statusCode}: {cloudResult.error}</p>
              )}
            </div>
          )}
          
          {localResult && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Local OCR Result:</h4>
              {localResult.success ? (
                <div>
                  <p className="text-sm mb-2">Extracted {localResult.length} characters</p>
                  <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{localResult.text.substring(0, 300)}</pre>
                </div>
              ) : (
                <p className="text-destructive">Error: {localResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload & Parse</CardTitle>
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
            <p><strong>Cloud OCR:</strong> Uses Lovable AI (Gemini 2.5 Pro) for more accurate extraction</p>
            <p><strong>Fallback:</strong> If Cloud OCR fails, automatically falls back to local OCR</p>
            <p><strong>Diagnostics:</strong> Use the test buttons above to run Cloud and Local OCR separately</p>
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
