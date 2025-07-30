import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';
import IFTACalculator from '@/components/IFTACalculator';

import { ComingSoon } from "@/components/ComingSoon";
import { FileText } from "lucide-react";

const IFTAReports = () => {
  return <ComingSoon 
    title="IFTA Reports Coming Soon" 
    description="Automated quarterly IFTA report generation with state-by-state calculations"
    icon={FileText}
  />;
};

export default IFTAReports;