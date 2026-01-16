import { Shield, MapPin, Camera, Lock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import AccountDeletionDialog from './AccountDeletionDialog';

const DataSafetySection = () => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security & Privacy
        </CardTitle>
        <CardDescription>
          Manage your data and understand how we protect your information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Safety Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Data Safety Summary
          </h4>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">GPS Location</p>
                <p className="text-muted-foreground">
                  Used for automatic mileage tracking and route calculation. Location data is only collected when you're actively logging trips.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Camera className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Camera & Images</p>
                <p className="text-muted-foreground">
                  Used to scan fuel receipts and bills of lading. Images are securely stored and only accessible by you.
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
            <p>
              <strong>Your data is encrypted</strong> in transit and at rest. We never sell your personal information to third parties.
            </p>
          </div>
        </div>

        {/* Privacy Links */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Terms of Service
          </Link>
        </div>

        {/* Account Deletion */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-destructive mb-2">Danger Zone</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated IFTA data. This action cannot be undone.
          </p>
          <AccountDeletionDialog />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSafetySection;
