
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Copy, Users, Gift } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ReferralCardProps {
  referralCount: number;
  referralEarnings: number;
  referrals: any[];
  onCopyLink: () => void;
  maskEmail: (email: string) => string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({
  referralCount,
  referralEarnings,
  referrals,
  onCopyLink,
  maskEmail
}) => {
  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              Your Referrals
            </CardTitle>
            <CardDescription>
              Invite friends and earn 10% of their purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{referralCount}</div>
            <p className="text-sm text-gray-500">Friends joined using your link</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full flex items-center justify-center"
              variant="outline" 
              onClick={onCopyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Referral Link
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Gift className="h-5 w-5 mr-2 text-green-500" />
              Referral Earnings
            </CardTitle>
            <CardDescription>
              10% from purchases and mining
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold text-green-600">{formatNumber(referralEarnings)}</div>
            <p className="text-sm text-gray-500">GCoin earned from referrals</p>
          </CardContent>
          <CardFooter>
            <div className="w-full bg-gray-50 rounded p-2 text-center">
              <p className="text-sm text-gray-600">
                Earnings are automatically credited to your wallet
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* How Referrals Work */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">1. Share Your Link</h3>
              <p className="text-sm text-gray-500">Invite friends using your unique referral link</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">2. Friends Join</h3>
              <p className="text-sm text-gray-500">Your friends sign up and start using GCoin</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">3. Earn 10% Bonus</h3>
              <p className="text-sm text-gray-500">Receive 10% of your friends' purchases & mining</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-1">Special Launch Promotion!</h3>
            <p className="text-sm text-yellow-700">
              For a limited time, you'll also get a <span className="font-semibold">1000 GCoin bonus</span> for each friend who signs up and verifies their account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referred Friends */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referred Friends</CardTitle>
          <CardDescription>
            People who joined using your referral link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {referral.referred_user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{referral.referred_user.username}</div>
                      <div className="text-sm text-gray-500">
                        {maskEmail(referral.referred_user.email)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Active
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Share2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="mb-2">No referrals yet</p>
              <p className="text-sm">Share your referral link to start earning!</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onCopyLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Referral Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReferralCard;
