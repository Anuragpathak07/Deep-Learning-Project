import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, CheckCircle2, Clock, XCircle, Car, User, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getScanHistory, HistoryScan } from "@/lib/history";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<HistoryScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<HistoryScan | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const filtered = history.filter((h) =>
    h.plate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
            <p className="text-sm text-muted-foreground">View all previous detection results</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by plate..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0 border border-border/50">
                <Car className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground tracking-wider">{item.plate}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.status === "success" ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {item.confidence.toFixed(1)}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedScan(item)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No scans found in history.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedScan} onOpenChange={(open) => !open && setSelectedScan(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-widest gradient-text">{selectedScan?.plate}</span>
            </DialogTitle>
            <DialogDescription>Scanned on {selectedScan?.date}</DialogDescription>
          </DialogHeader>

          {selectedScan && (
             <div className="space-y-6 mt-4">
                {selectedScan.owner ? (
                  <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">Extracted Owner Details</h3>
                    {[
                      { icon: User, label: "Owner Name", value: selectedScan.owner.name },
                      { icon: Car, label: "Vehicle", value: selectedScan.owner.vehicleType },
                      { icon: FileText, label: "Reg. Number", value: selectedScan.owner.registrationNumber },
                      { icon: Calendar, label: "Reg. Date", value: selectedScan.owner.registrationDate },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
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
                ) : (
                   <p className="text-sm text-muted-foreground text-center p-4">Detailed records were not extracted for this scan.</p>
                )}
             </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
