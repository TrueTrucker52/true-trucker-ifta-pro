import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Receipt, Scan, CheckCircle, Upload } from "lucide-react";

export const ReceiptScanAnimation = () => {
  const [scanStage, setScanStage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScanStage((prev) => (prev + 1) % 4);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { icon: Upload, text: "Upload Receipt", color: "text-blue-500" },
    { icon: Scan, text: "Scanning...", color: "text-yellow-500" },
    { icon: Receipt, text: "Processing Data", color: "text-orange-500" },
    { icon: CheckCircle, text: "Complete!", color: "text-green-500" }
  ];

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Animated background circles */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border-2 border-secondary/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border-2 border-accent/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center icon and text */}
      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={scanStage}
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-2"
          >
            {(() => {
              const Stage = stages[scanStage];
              return (
                <>
                  <Stage.icon className={`h-12 w-12 ${Stage.color}`} />
                  <span className={`text-sm font-medium ${Stage.color}`}>
                    {Stage.text}
                  </span>
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>
        
        {/* Scanning line effect */}
        {scanStage === 1 && (
          <motion.div
            className="absolute top-0 left-1/2 w-px h-16 bg-gradient-to-b from-transparent via-yellow-500 to-transparent"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 40, opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ x: "-50%" }}
          />
        )}
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {stages.map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: index <= scanStage ? "hsl(210 100% 50%)" : "hsl(220 15% 92%)",
              scale: index === scanStage ? 1.5 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};