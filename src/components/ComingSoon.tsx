import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
  expectedDate?: string;
}

export const ComingSoon = ({ 
  title, 
  description, 
  icon: Icon = Clock,
  expectedDate = "Q1 2026"
}: ComingSoonProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-warning">
        <CardHeader className="text-center">
          <div className="bg-warning/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icon className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              This feature is currently under development and will be available in <strong>{expectedDate}</strong>.
            </p>
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Start Free Trial Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};