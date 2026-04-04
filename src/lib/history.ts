export interface HistoryScan {
  id: string;
  plate: string;
  date: string;
  status: "success" | "failed";
  confidence: number;
  processingTime?: string;
  imageUrl?: string;
  owner?: {
    name: string;
    vehicleType: string;
    registrationDate: string;
    registrationNumber: string;
  };
}

export const getScanHistory = (): HistoryScan[] => {
  try {
    const data = localStorage.getItem("platesense_history");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse history", error);
    return [];
  }
};

export const saveScanToHistory = (scan: Omit<HistoryScan, "id" | "date">) => {
  const history = getScanHistory();
  
  const now = new Date();
  const dateStr = now.getFullYear() + "-" + 
    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
    String(now.getDate()).padStart(2, '0') + " " + 
    String(now.getHours()).padStart(2, '0') + ":" + 
    String(now.getMinutes()).padStart(2, '0');

  const newScan: HistoryScan = {
    ...scan,
    id: crypto.randomUUID(),
    date: dateStr,
  };
  
  let newHistory = [newScan, ...history];
  
  // Continuously attempt to save to localStorage
  // If 5MB quota is exceeded, safely drop the oldest scans until it fits!
  while (newHistory.length > 0) {
    try {
      localStorage.setItem("platesense_history", JSON.stringify(newHistory));
      break; 
    } catch (e: any) {
      if (e.name === "QuotaExceededError" || 
          e.name === "NS_ERROR_DOM_QUOTA_REACHED" || 
          e.message?.includes("quota") ||
          e.message?.includes("exceeded")) {
        // LocalStorage is full, evict the oldest scan
        newHistory.pop();
        if (newHistory.length === 0) {
          // Absolute fallback: if the single new scan is somehow too gigantic, strip the image!
          console.warn("Image is too large for storage, saving data without image thumbnail.");
          const fallbackScan = { ...newScan, imageUrl: undefined };
          localStorage.setItem("platesense_history", JSON.stringify([fallbackScan, ...history].slice(0, 10)));
          break;
        }
      } else {
        throw e;
      }
    }
  }
  
  return newScan;
};

export const clearScanHistory = () => {
  localStorage.removeItem("platesense_history");
};
