
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Wallet, Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";

interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  wallet_address: string;
  balance: number;
  created_at: string;
  last_login: string | null;
  last_ip: string | null;
}

const AdminUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a wallet address, username, or email to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('admin_search_user', {
        search_term: searchTerm.trim()
      });

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Results",
          description: "No users found matching your search criteria.",
        });
      }
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          User Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by wallet address, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="min-w-[100px]"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-lg">Search Results ({searchResults.length})</h3>
            {searchResults.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.username}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(user.balance)} GCoins
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Wallet Address</p>
                        <p className="font-mono text-xs">{user.wallet_address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Registration Date</p>
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Last Login</p>
                        <p>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Last IP Address</p>
                        <p className="font-mono text-xs">{user.last_ip || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserSearch;
