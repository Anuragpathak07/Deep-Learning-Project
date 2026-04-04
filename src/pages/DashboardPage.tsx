import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getScanHistory, HistoryScan } from "@/lib/history";
import { motion } from "framer-motion";
import { ScanLine, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryScan[]>([]);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const totalScans = history.length;
  const successfulScans = history.filter(h => h.status === "success").length;
  const failedScans = totalScans - successfulScans;
  const avgConfidence = successfulScans > 0 
    ? history.filter(h => h.status === "success").reduce((acc, curr) => acc + curr.confidence, 0) / successfulScans 
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's a summary of your automated plate detections.</p>
          </div>
          <Link to="/dashboard/upload">
            <Button className="gap-2">
              <ScanLine className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ScanLine className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold">{totalScans}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Scans Performed</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-3xl font-bold text-success">{avgConfidence.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">Average Model Confidence</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-3xl font-bold text-destructive">{failedScans}</p>
            <p className="text-sm text-muted-foreground mt-1">Failed Detections</p>
          </motion.div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <Link to="/dashboard/history" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="glass-card overflow-hidden">
            {history.length > 0 ? (
              <div className="divide-y divide-border/50">
                {history.slice(0, 5).map((scan) => (
                  <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{scan.plate}</p>
                        <p className="text-xs text-muted-foreground">{scan.date}</p>
                      </div>
                    </div>
                    <div>
                      {scan.status === "success" ? (
                        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                          {scan.confidence.toFixed(1)}% Confidence
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                You haven't performed any scans yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
