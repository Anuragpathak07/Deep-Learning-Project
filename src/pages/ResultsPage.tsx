import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, ScanLine, User, Car, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const result = {
  plate: "MH 12 AB 1234",
  confidence: 99.2,
  processingTime: "1.34s",
  owner: {
    name: "Rajesh Kumar",
    vehicleType: "Sedan — Toyota Camry",
    registrationDate: "15 March 2022",
    registrationNumber: "MH-12-2022-0045671",
  },
};

export default function ResultsPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detection Results</h1>
            <p className="text-sm text-muted-foreground">Detailed breakdown of the scan</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-2">
            <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Vehicle Image Preview</span>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-success rounded-lg px-6 py-2" style={{ boxShadow: "0 0 20px hsl(142 71% 45% / 0.3)" }}>
                <span className="text-success font-bold text-lg tracking-widest">{result.plate}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Details */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Detected Number Plate</p>
              <p className="text-4xl font-extrabold tracking-[0.25em] gradient-text">{result.plate}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card text-center">
                <p className="text-xs text-muted-foreground mb-2">Confidence</p>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="hsl(222 20% 18%)" strokeWidth="3" />
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="3" strokeDasharray={`${result.confidence}, 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-success">{result.confidence}%</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground mb-2">Processing Time</p>
                <p className="text-3xl font-bold text-accent">{result.processingTime}</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Owner Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="font-semibold text-foreground">Vehicle Owner Details</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: User, label: "Owner Name", value: result.owner.name },
              { icon: Car, label: "Vehicle", value: result.owner.vehicleType },
              { icon: FileText, label: "Registration Number", value: result.owner.registrationNumber },
              { icon: Calendar, label: "Registration Date", value: result.owner.registrationDate },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <Button variant="glass" size="lg" className="flex-1">
            <Download className="w-4 h-4" /> Download Report
          </Button>
          <Button size="lg" className="flex-1" onClick={() => navigate("/dashboard")}>
            <ScanLine className="w-4 h-4" /> Run Another Scan
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
