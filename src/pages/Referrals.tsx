import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferrals } from '@/hooks/useReferrals';
import BottomNavigation from '@/components/BottomNavigation';
import { Gift, Copy, Share2, MessageSquare, Mail, Link, Check, Clock, UserPlus, Trophy, Star, Crown, Send } from 'lucide-react';

const Referrals: React.FC = () => {
  const {
    referrals, rewards, stats, referralCode, loading,
    sendInvite, getShareText, getReferralLink,
    copyCode, copyLink, shareNative, milestones,
  } = useReferrals();
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSendInvite = () => {
    if (inviteEmail.includes('@')) {
      sendInvite(inviteEmail);
      setInviteEmail('');
    }
  };

  const milestoneProgress = stats.nextMilestone.target > 0
    ? (stats.nextMilestone.current / stats.nextMilestone.target) * 100
    : 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'converted': case 'rewarded': return <Check className="h-4 w-4 text-green-600" />;
      case 'signed_up': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted': case 'rewarded': return <Badge className="bg-green-100 text-green-700 border-green-200">Converted ✅</Badge>;
      case 'signed_up': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">On Trial ⏳</Badge>;
      default: return <Badge variant="secondary">Invite Sent 📧</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">🚛</div>
          <h1 className="text-2xl font-bold text-foreground">Refer a Trucker — Earn Free Months!</h1>
          <p className="text-sm text-muted-foreground">Share your code and earn rewards when they upgrade</p>
        </div>

        {/* Referral Code Card */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Referral Code</p>
              <p className="text-3xl font-black text-primary tracking-wider mt-1">{referralCode || '...'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={copyCode}>
                <Copy className="h-4 w-4" /> Copy Code
              </Button>
              <Button className="flex-1 gap-2" onClick={shareNative}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Your link:</p>
              <button onClick={copyLink} className="text-xs text-primary underline break-all">
                {getReferralLink()}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { step: 1, text: 'Share your code with a trucker', emoji: '📲' },
              { step: 2, text: 'They sign up using your code', emoji: '✅' },
              { step: 3, text: 'They complete their free trial', emoji: '⏳' },
              { step: 4, text: 'They upgrade to a paid plan', emoji: '💳' },
              { step: 5, text: 'YOU get 1 FREE month! 🎉 THEY get 1 FREE month! 🎉', emoji: '🎁' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{s.step}</div>
                <p className="text-sm text-foreground">{s.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bonus Rewards */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-600" /> Bonus Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((m, i) => {
              const achieved = stats.convertedCount >= m.target;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${achieved ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-background/50 border-border'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{achieved ? '✅' : i === 0 ? '🎁' : i === 1 ? '🏆' : i === 2 ? '🚀' : '👑'}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.target} referral{m.target !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground">{m.reward}</p>
                    </div>
                  </div>
                  {achieved && <Badge className="bg-green-100 text-green-700 border-green-200">Earned!</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Stats & Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">{stats.convertedCount}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{stats.freeMonthsEarned}</p>
                <p className="text-xs text-muted-foreground">Free Months</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next reward: {stats.nextMilestone.reward}</span>
                <span className="font-semibold text-foreground">{stats.nextMilestone.current}/{stats.nextMilestone.target}</span>
              </div>
              <Progress value={milestoneProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {stats.nextMilestone.target - stats.nextMilestone.current} more to go!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Invite by Email */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Invite a Trucker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="trucker@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                type="email"
              />
              <Button onClick={handleSendInvite} disabled={!inviteEmail.includes('@')} className="gap-1">
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`sms:?body=${encodeURIComponent(getShareText())}`)}>
                <MessageSquare className="h-4 w-4" /> Text Message
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Save time on IFTA filing 🚛')}&body=${encodeURIComponent(getShareText())}`)}>
                <Mail className="h-4 w-4" /> Email
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`)}>
                📱 WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={copyLink}>
                <Link className="h-4 w-4" /> Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral List */}
        {referrals.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📋 My Referrals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ref.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{ref.referred_email || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {ref.converted_at ? `Upgraded ${new Date(ref.converted_at).toLocaleDateString()}` :
                         ref.signed_up_at ? `Signed up ${new Date(ref.signed_up_at).toLocaleDateString()}` :
                         `Invited ${new Date(ref.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(ref.status)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rewards History */}
        {rewards.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">🎁 Rewards Earned</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rewards.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.reward_type === 'free_month' ? `${r.reward_value} Free Month${r.reward_value > 1 ? 's' : ''}` : r.reward_type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={r.reward_status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {r.reward_status === 'applied' ? '✅ Applied' : '⏳ Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Referrals;
