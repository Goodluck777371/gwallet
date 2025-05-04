
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreVertical, 
  Loader2, 
  User, 
  Ban,
  Shield,
  Copy,
  Eye,
  UserCheck,
  AlertTriangle
} from "lucide-react";

interface UserData {
  id: string;
  username: string;
  email: string;
  wallet_address: string;
  balance: number;
  created_at: string;
  is_banned?: boolean;
  is_frozen?: boolean;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'freeze' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate random values for banned/frozen status
      // In a real app, these would come from your database
      const usersWithStatus = data?.map(user => ({
        ...user,
        is_banned: Math.random() > 0.9, // 10% chance of being banned for demo
        is_frozen: Math.random() > 0.85, // 15% chance of being frozen for demo
      })) || [];

      setUsers(usersWithStatus);
      setFilteredUsers(usersWithStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error({
        title: "Error",
        description: "Failed to load users data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = users.filter(
        user =>
          user.username.toLowerCase().includes(lowerSearchTerm) ||
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.wallet_address.toLowerCase().includes(lowerSearchTerm) ||
          user.id.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleUserAction = (user: UserData, action: 'ban' | 'freeze' | 'view') => {
    setSelectedUser(user);
    
    if (action === 'view') {
      setShowUserDetails(true);
    } else {
      setActionType(action);
      setActionModalOpen(true);
    }
  };

  const executeAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsLoading(true);
    
    try {
      // In a real app, you would call your API to update the user's status
      // This is just a simulation
      setTimeout(() => {
        if (actionType === 'ban') {
          toast({
            title: "User Banned",
            description: `${selectedUser.username} has been banned from the platform.`,
          });
        } else if (actionType === 'freeze') {
          toast({
            title: "Account Frozen",
            description: `${selectedUser.username}'s account has been frozen.`,
          });
        }
        
        // Update the user in the local state
        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            if (actionType === 'ban') {
              return { ...user, is_banned: true };
            } else if (actionType === 'freeze') {
              return { ...user, is_frozen: true };
            }
          }
          return user;
        });
        
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      }, 1000);

    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error);
      toast.error({
        title: "Action Failed",
        description: `Failed to ${actionType} this user.`,
      });
    } finally {
      setActionModalOpen(false);
      setSelectedUser(null);
      setActionType(null);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: "The value has been copied to clipboard.",
    });
  };

  const generateUserIdBadge = (id: string) => {
    // Create a deterministic but shorter ID for display
    const shortId = id.substring(0, 4) + id.substring(id.length - 4);
    return `#${shortId}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 mt-1">
            Manage and monitor registered users
          </p>
        </div>
        <div className="mt-4 sm:mt-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-9 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">User ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">
                    {generateUserIdBadge(user.id)}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{user.email}</TableCell>
                  <TableCell className="font-mono text-sm max-w-[180px] truncate">
                    {user.wallet_address}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(user.balance)} GCoin
                  </TableCell>
                  <TableCell>
                    {user.is_banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Ban className="h-3 w-3 mr-1" />
                        Banned
                      </span>
                    ) : user.is_frozen ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Frozen
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUserAction(user, 'view')}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => copyToClipboard(user.id, 'User ID')}>
                          <Copy className="h-4 w-4 mr-2" /> Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(user.wallet_address, 'Wallet Address')}>
                          <Copy className="h-4 w-4 mr-2" /> Copy Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleUserAction(user, 'ban')}
                          disabled={user.is_banned}
                        >
                          <Ban className="h-4 w-4 mr-2" /> Ban User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-amber-600"
                          onClick={() => handleUserAction(user, 'freeze')}
                          disabled={user.is_frozen}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" /> Freeze Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  No users found matching your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono text-sm">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Username:</span>
                <span>{selectedUser.username}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Email:</span>
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Wallet Address:</span>
                <span className="font-mono text-sm">{selectedUser.wallet_address}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Balance:</span>
                <span>{formatNumber(selectedUser.balance)} GCoin</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Joined:</span>
                <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Status:</span>
                <div>
                  {selectedUser.is_banned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Banned
                    </span>
                  ) : selectedUser.is_frozen ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Frozen
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              {actionType === 'ban' ? (
                <>
                  <Ban className="h-5 w-5 mr-2" />
                  Ban User
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Freeze Account
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban' 
                ? "This action will prevent the user from accessing the platform." 
                : "This action will freeze all transactions for this account."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div>
              <p className="mb-4">
                Are you sure you want to {actionType}{' '}
                <span className="font-medium">{selectedUser.username}</span>?
              </p>
              <p className="text-sm text-gray-500">
                This action can be reversed later through the admin panel.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeAction} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${actionType === 'ban' ? 'Ban' : 'Freeze'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
