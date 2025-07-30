import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Settings } from 'lucide-react';

const AuthFix = () => {
  const projectId = "tlvngzfoxpjdltbpmzaz";
  
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          Authentication Fix Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          The captcha verification error needs to be fixed in the Supabase dashboard. Follow these steps:
        </p>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-medium">Go to Supabase Authentication Settings</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-1"
                onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/auth/providers`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Auth Settings
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-medium">Disable Enable Captcha Protection</p>
              <p className="text-yellow-600 text-xs">Turn OFF the "Enable Captcha Protection" toggle</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-medium">Set Site URL and Redirect URLs</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-1"
                onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/auth/url-configuration`, '_blank')}
              >
                <Settings className="h-4 w-4 mr-1" />
                URL Configuration
              </Button>
              <div className="mt-1 space-y-1 text-xs">
                <p>Site URL: <code className="bg-yellow-100 px-1 rounded">https://true-trucker-ifta-pro.com</code></p>
                <p>Redirect URLs: Add both staging and production URLs</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <div>
              <p className="font-medium">Disable Email Confirmations (for testing)</p>
              <p className="text-yellow-600 text-xs">Turn OFF "Enable email confirmations" for faster testing</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-100 p-3 rounded-lg">
          <p className="text-xs text-yellow-800 font-medium">
            💡 After making these changes, the authentication system should work properly and users can sign up/sign in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthFix;