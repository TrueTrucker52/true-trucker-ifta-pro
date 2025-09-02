import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, TestTube, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface TestAccount {
  email: string;
  password: string;
  type: string;
  description: string;
}

const testAccounts: TestAccount[] = [
  {
    email: "reviewer@truetrucker.com",
    password: "TestReview2024!",
    type: "Primary Reviewer",
    description: "Main account for Google Play Store review team"
  },
  {
    email: "tester1@truetrucker.com", 
    password: "TestReview2024!",
    type: "Beta Tester",
    description: "Beta testing account #1"
  },
  {
    email: "tester2@truetrucker.com",
    password: "TestReview2024!", 
    type: "Beta Tester",
    description: "Beta testing account #2"
  }
];

const TestCredentials = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

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
      </div>

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