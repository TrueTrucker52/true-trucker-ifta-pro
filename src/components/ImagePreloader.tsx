import { useEffect } from 'react';
import heroTruck from "@/assets/hero-truck.jpg";
import appScreenshot1 from "@/assets/app-screenshot-1.jpg";
import appScreenshot2 from "@/assets/app-screenshot-2.jpg";
import appScreenshot3 from "@/assets/app-screenshot-3.jpg";

const ImagePreloader = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      heroTruck,
      appScreenshot1,
      appScreenshot2,
      appScreenshot3
    ];

    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};

export default ImagePreloader;