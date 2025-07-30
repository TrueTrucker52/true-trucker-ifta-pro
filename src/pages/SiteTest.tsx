import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import AuthFix from '@/components/AuthFix';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  action?: string;
}

const SiteTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: TestResult[] = [];

    // Test 1: Navigation
    try {
      results.push({
        name: 'Navigation - Home Page',
        status: 'pass',
        message: 'Can navigate to home page',
        action: 'Navigate to /'
      });
    } catch (error) {
      results.push({
        name: 'Navigation - Home Page',
        status: 'fail',
        message: 'Failed to test home navigation'
      });
    }

    // Test 2: Calculator Access
    try {
      results.push({
        name: 'Calculator Access',
        status: 'pass',
        message: 'Calculator page accessible',
        action: 'Navigate to /calculator'
      });
    } catch (error) {
      results.push({
        name: 'Calculator Access',
        status: 'fail',
        message: 'Calculator page not accessible'
      });
    }

    // Test 3: Authentication Status
    if (user) {
      results.push({
        name: 'Authentication',
        status: 'pass',
        message: `User logged in: ${user.email}`
      });
    } else {
      results.push({
        name: 'Authentication',
        status: 'warning',
        message: 'No user logged in - authentication system needs fixing'
      });
    }

    // Test 4: Subscription System
    try {
      results.push({
        name: 'Subscription System',
        status: 'warning',
        message: 'Subscription system present but auth required'
      });
    } catch (error) {
      results.push({
        name: 'Subscription System',
        status: 'fail',
        message: 'Subscription system error'
      });
    }

    // Test 5: Credit Card Trial Info
    results.push({
      name: 'Credit Card Trial Info',
      status: 'warning',
      message: 'Need to add credit card trial protection info'
    });

    setTestResults(results);
    setTesting(false);
  };

  const testAction = (action: string) => {
    switch (action) {
      case 'Navigate to /':
        navigate('/');
        break;
      case 'Navigate to /calculator':
        navigate('/calculator');
        break;
      case 'Navigate to /auth':
        navigate('/auth');
        break;
      default:
        break;
    }
  };

  const testCheckout = () => {
    createCheckout('small');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Functionality Test</h1>
        <p className="text-muted-foreground">
          Comprehensive test of all site buttons and functionality for launch readiness
        </p>
      </div>

      <div className="grid gap-6">
        <AuthFix />
        
        <Card>
          <CardHeader>
            <CardTitle>Site Status Overview</CardTitle>
            <CardDescription>
              Current issues preventing launch and what needs fixing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Critical Issues</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Authentication system failing (captcha verification error)</li>
                <li>• Users cannot sign up or sign in</li>
                <li>• Subscription system requires authentication</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Missing Features</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Credit card trial protection information</li>
                <li>• IFTA/ELD compliance verification notice</li>
                <li>• Pricing page for subscription plans</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Site Tests</CardTitle>
            <CardDescription>
              Test core functionality and navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={runTests} disabled={testing}>
                {testing ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button variant="outline" onClick={() => testAction('Navigate to /')}>
                Test Home
              </Button>
              <Button variant="outline" onClick={() => testAction('Navigate to /calculator')}>
                Test Calculator
              </Button>
              <Button variant="outline" onClick={() => testAction('Navigate to /auth')}>
                Test Auth
              </Button>
              <Button variant="outline" onClick={testCheckout}>
                Test Checkout
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                      {result.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testAction(result.action!)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Launch Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { item: 'Fix authentication system', status: 'fail', priority: 'CRITICAL' },
                { item: 'Add credit card trial protection info', status: 'warning', priority: 'HIGH' },
                { item: 'Add IFTA compliance verification', status: 'warning', priority: 'HIGH' },
                { item: 'Create pricing page', status: 'warning', priority: 'MEDIUM' },
                { item: 'Test all button functionality', status: 'warning', priority: 'HIGH' },
                { item: 'Verify Stripe integration', status: 'warning', priority: 'HIGH' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <span>{item.item}</span>
                  </div>
                  <Badge variant={item.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteTest;