import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Key, Cpu, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  const [apiEndpoint, setApiEndpoint] = useState("https://api.example.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("yolov8");
  const [notifications, setNotifications] = useState(true);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your PlateVision instance</p>
        </div>

        {/* API Config */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">API Configuration</h2>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">API Endpoint</Label>
            <Input value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">API Key</Label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" className="bg-secondary border-border" />
          </div>
        </motion.div>

        {/* Model Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Model Selection</h2>
          </div>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yolov8">YOLOv8 — Fast & Accurate</SelectItem>
              <SelectItem value="yolov9">YOLOv9 — Latest</SelectItem>
              <SelectItem value="ssd">SSD MobileNet — Lightweight</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Preferences</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Get notified when processing completes</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </motion.div>

        <Button size="lg" className="w-full">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
