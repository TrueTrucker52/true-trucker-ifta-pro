import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, TestTube, Users, Shield, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";

interface TestAccount {
  email: string;
  password: string;
  type: string;
  description: string;
  isActive?: boolean;
  expiresAt?: string | null;
}

const TestCredentials = () => {
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchTestCredentials();
    } else if (!adminLoading && !isAdmin) {
      setLoading(false);
      setError("Admin access required to view test credentials");
    }
  }, [isAdmin, adminLoading]);

  const fetchTestCredentials = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Authentication required");
        return;
      }

      const response = await supabase.functions.invoke("get-test-credentials", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch credentials");
      }

      if (response.data?.accounts) {
        setTestAccounts(response.data.accounts);
      } else {
        setTestAccounts([]);
      }
    } catch (err: any) {
      console.error("Error fetching test credentials:", err);
      setError(err.message || "Failed to load test credentials");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Show loading state
  if (adminLoading || loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading test credentials...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Test credentials are only accessible to administrators. 
              Please contact your system administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              Error Loading Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            <Button onClick={fetchTestCredentials} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TestTube className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Google Play Store Test Credentials</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Use these test accounts for Google Play Store app review and beta testing. 
          These accounts have full access to all app features without affecting real user data.
        </p>
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <Shield className="w-3 h-3 mr-1" />
          Admin Only - Secure Access
        </Badge>
      </div>

      {testAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No test accounts configured. Add test accounts to the database to display them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {testAccounts.map((account, index) => (
            <Card key={index} className="border-2 border-dashed border-primary/20 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={account.type === "Primary Reviewer" ? "default" : "secondary"} className="mb-2">
                    {account.type === "Primary Reviewer" ? (
                      <Shield className="w-3 h-3 mr-1" />
                    ) : (
                      <Users className="w-3 h-3 mr-1" />
                    )}
                    {account.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{account.email}</CardTitle>
                <CardDescription className="text-sm">
                  {account.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(account.email, "Email")}
                        className="h-auto p-1 hover:bg-muted"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="bg-muted/50 p-2 rounded text-sm font-mono break-all">
                      {account.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Password:</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(account.password, "Password")}
                        className="h-auto p-1 hover:bg-muted"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="bg-muted/50 p-2 rounded text-sm font-mono">
                      {account.password}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Shield className="w-5 h-5" />
            Important Notes for App Store Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-yellow-800 dark:text-yellow-200">
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>These test accounts provide full access to all IFTA tracking, receipt scanning, and reporting features</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>Test data will not interfere with real customer accounts or data</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>All premium features are unlocked for testing purposes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>Use the primary reviewer account for Google Play Console submission</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>Beta tester accounts can be shared with your 12 testing group members</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCredentials;
