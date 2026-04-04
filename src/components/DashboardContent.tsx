import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, ScanLine, CheckCircle2, AlertCircle, ZoomIn, Car, User, Calendar, FileText, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { saveScanToHistory } from "@/lib/history";
import { useToast } from "@/components/ui/use-toast";

interface DetectionResult {
  plate: string;
  confidence: number;
  processingTime: string;
  owner: {
    name: string;
    vehicleType: string;
    registrationDate: string;
    registrationNumber: string;
  };
}


export default function DashboardContent() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setFile(f);
      setResult(null);
      setErrorText(null);
    };
    reader.readAsDataURL(f);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const runDetection = async () => {
    if (!file || !image) return;
    setIsProcessing(true);
    setErrorText(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to process image via API");
      }

      const data = await response.json();
      const newResult: DetectionResult = {
        plate: data.plate_number,
        confidence: data.confidence * 100 > 100 ? data.confidence : data.confidence * 100,
        processingTime: data.processing_time,
        owner: {
          name: data.owner_details?.owner_name || data.owner_details?.name || "Unknown",
          vehicleType: data.owner_details?.vehicle_type || "Unknown",
          registrationDate: data.owner_details?.registration_date || "Unknown",
          registrationNumber: data.plate_number,
        }
      };
      
      setResult(newResult);
      
      saveScanToHistory({
        plate: newResult.plate,
        status: "success",
        confidence: newResult.confidence,
        processingTime: newResult.processingTime,
        owner: newResult.owner,
      });

      toast({
        title: "Scan Complete",
        description: `Successfully detected plate: ${newResult.plate}`,
      });
      
    } catch (err: any) {
      setErrorText(err.message || "An error occurred");
      saveScanToHistory({
        plate: "—",
        status: "failed",
        confidence: 0,
      });
      toast({
        title: "Scan Failed",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setErrorText(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a vehicle image to detect and extract the number plate</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {!image ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`upload-zone flex flex-col items-center justify-center p-12 min-h-[320px] ${dragActive ? "border-primary bg-primary/5" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG — Max 10MB</p>
              <input id="file-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-2 relative group">
              <div className="relative rounded-xl overflow-hidden">
                <img src={image} alt="Uploaded vehicle" className="w-full rounded-xl object-cover max-h-[400px]" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary scan-line rounded-full" />
                    <div className="glass-card px-6 py-3 flex items-center gap-3">
                      <ScanLine className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-foreground">Analyzing...</span>
                    </div>
                  </div>
                )}
                {result && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-success rounded-lg px-6 py-2" style={{ boxShadow: "0 0 20px hsl(142 71% 45% / 0.3)" }}>
                    <span className="text-success font-bold text-xl tracking-widest">{result.plate}</span>
                  </motion.div>
                )}
                <button className="absolute top-3 right-3 glass-card p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {errorText && (
                <p className="mt-4 text-sm text-destructive font-medium text-center">
                  ⚠️ {errorText}
                </p>
              )}
            </motion.div>
          )}

          {image && !result && (
            <Button size="lg" className="w-full" onClick={runDetection} disabled={isProcessing}>
              {isProcessing ? (
                <><ScanLine className="w-5 h-5 animate-pulse" /> Processing...</>
              ) : (
                <><ScanLine className="w-5 h-5" /> Run Detection</>
              )}
            </Button>
          )}
          {result && (
            <Button variant="glass" size="lg" className="w-full" onClick={reset}>
              Run Another Scan
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Detected Plate</p>
                <p className="text-3xl font-extrabold tracking-[0.2em] gradient-text">{result.plate}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-2">Confidence</p>
                  <p className="text-2xl font-bold text-success">{result.confidence.toFixed(1)}%</p>
                  <Progress value={result.confidence} className="mt-2 h-1.5 bg-muted [&>div]:bg-success" />
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Processing Time</p>
                  </div>
                  <p className="text-2xl font-bold text-accent">{result.processingTime}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="text-sm font-medium text-foreground">Owner Details Retrieved</p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: User, label: "Owner Name", value: result.owner.name },
                    { icon: Car, label: "Vehicle", value: result.owner.vehicleType },
                    { icon: FileText, label: "Reg. Number", value: result.owner.registrationNumber },
                    { icon: Calendar, label: "Reg. Date", value: result.owner.registrationDate },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-foreground font-medium">No Results Yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload an image and run detection to see results here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}