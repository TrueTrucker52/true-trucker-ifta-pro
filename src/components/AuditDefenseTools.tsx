import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, FileText, Download, Eye, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuditItem {
  id: string;
  category: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  status: 'resolved' | 'pending' | 'review';
  recommendation: string;
  documents: string[];
}

const auditIssues: AuditItem[] = [
  {
    id: '1',
    category: 'Mileage Records',
    issue: 'Missing trip sheets for 3 days in Q2',
    severity: 'high',
    status: 'pending',
    recommendation: 'Upload GPS logs or reconstruct trips using fuel purchase records',
    documents: ['Trip Sheet Template', 'GPS Log Q2-2024']
  },
  {
    id: '2',
    category: 'Fuel Receipts',
    issue: 'Receipt image quality issues (2 receipts)',
    severity: 'medium',
    status: 'review',
    recommendation: 'AI-enhanced receipt processing completed, manual verification needed',
    documents: ['Enhanced Receipt 1', 'Enhanced Receipt 2']
  },
  {
    id: '3',
    category: 'Tax Calculations',
    issue: 'Minor discrepancy in Nevada calculations ($4.50)',
    severity: 'low',
    status: 'resolved',
    recommendation: 'Rounding adjustment applied per IFTA guidelines',
    documents: ['Calculation Worksheet', 'IFTA Guidelines Reference']
  }
];

const complianceScore = 94;

export const AuditDefenseTools = () => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'review': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Audit Defense Center
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="flex items-center gap-2">
                <Progress value={complianceScore} className="w-24" />
                <span className="font-semibold text-lg">{complianceScore}%</span>
              </div>
            </div>
          </div>
          <Badge variant={complianceScore >= 95 ? 'default' : 'secondary'}>
            {complianceScore >= 95 ? 'Audit Ready' : 'Needs Attention'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues">Issues & Fixes</TabsTrigger>
            <TabsTrigger value="documents">Defense Kit</TabsTrigger>
            <TabsTrigger value="preparation">Audit Prep</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            {auditIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedIssue === issue.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(issue.status)}
                      <h3 className="font-semibold">{issue.category}</h3>
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.issue}</p>
                    <p className="text-sm">{issue.recommendation}</p>
                  </div>
                </div>

                {selectedIssue === issue.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <h4 className="font-semibold mb-2">Supporting Documents:</h4>
                    <div className="space-y-2">
                      {issue.documents.map((doc) => (
                        <div key={doc} className="flex items-center justify-between bg-muted/50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        Auto-Fix Issue
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Generate Response
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Complete IFTA Package', desc: 'All quarterly reports & supporting docs', icon: FileText },
                { name: 'GPS Tracking Records', desc: 'Detailed route and mileage logs', icon: FileText },
                { name: 'Enhanced Receipts', desc: 'AI-processed fuel purchase records', icon: FileText },
                { name: 'Compliance Certificate', desc: 'IFTA compliance verification', icon: Shield },
                { name: 'Audit Response Template', desc: 'Pre-written audit defense responses', icon: FileText },
                { name: 'Legal Defense Package', desc: 'Expert review and consultation', icon: Shield }
              ].map((doc, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <doc.icon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground">{doc.desc}</p>
                      <Button size="sm" className="mt-2 w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preparation" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Audit Readiness Checklist
              </h3>
              
              <div className="space-y-3">
                {[
                  { task: 'All quarterly returns filed on time', completed: true },
                  { task: 'Fuel receipts organized and verified', completed: true },
                  { task: 'Trip sheets complete for all travel days', completed: false },
                  { task: 'GPS records backed up and accessible', completed: true },
                  { task: 'Defense documentation package ready', completed: true },
                  { task: 'Legal consultation scheduled (optional)', completed: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
                      )}
                      <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.task}
                      </span>
                    </div>
                    {!item.completed && (
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Pro Tip</h4>
                <p className="text-sm">
                  Our AI constantly monitors your records for potential audit triggers. 
                  We'll alert you 30 days before filing deadlines and automatically 
                  generate defense packages if any issues are detected.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};