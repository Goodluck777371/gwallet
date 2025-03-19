
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BarChart3, 
  DollarSign, 
  ArrowUpDown, 
  Shield, 
  Bell,
  UserX,
  UserCheck,
  Search,
  Eye,
  Filter,
  Plus,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Admin login state
const ADMIN_USERNAME = "adminuser";
const ADMIN_PASSWORD = "adminpassword123";

const Admin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Check if admin is already logged in
    const adminAuth = localStorage.getItem("gcoin-admin-auth");
    if (adminAuth === "true") {
      setIsAdminAuthenticated(true);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem("gcoin-admin-auth", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // Placeholder data for admin dashboard
  const stats = [
    { title: "Total Users", value: "1,248", icon: Users, color: "bg-blue-500" },
    { title: "Active Users", value: "865", icon: UserCheck, color: "bg-green-500" },
    { title: "Total Transactions", value: "8,942", icon: ArrowUpDown, color: "bg-purple-500" },
    { title: "Transaction Volume", value: "756,391 GCoin", icon: BarChart3, color: "bg-yellow-500" },
  ];

  const recentUsers = [
    { id: "U12345", username: "james_wilson", email: "james@example.com", status: "active", date: "2023-11-10", balance: "1,240" },
    { id: "U12346", username: "sarah_smith", email: "sarah@example.com", status: "active", date: "2023-11-09", balance: "3,520" },
    { id: "U12347", username: "michael_brown", email: "michael@example.com", status: "banned", date: "2023-11-08", balance: "0" },
    { id: "U12348", username: "emma_johnson", email: "emma@example.com", status: "active", date: "2023-11-07", balance: "980" },
    { id: "U12349", username: "test_account", email: "testemail@example.com", status: "active", date: "2023-11-06", balance: "5,000,000" },
  ];

  const recentTransactions = [
    { id: "TX78901", userId: "U12345", type: "send", amount: "120", status: "completed", date: "2023-11-10 14:35" },
    { id: "TX78902", userId: "U12346", type: "receive", amount: "350", status: "completed", date: "2023-11-10 12:22" },
    { id: "TX78903", userId: "U12348", type: "send", amount: "200", status: "failed", date: "2023-11-09 18:45" },
    { id: "TX78904", userId: "U12349", type: "convert", amount: "1,000", status: "completed", date: "2023-11-09 16:17" },
    { id: "TX78905", userId: "U12345", type: "stake", amount: "500", status: "pending", date: "2023-11-09 10:05" },
  ];

  const securityLogs = [
    { id: "L45678", event: "Failed login attempt", userId: "U12347", ip: "192.168.1.45", date: "2023-11-10 15:22" },
    { id: "L45679", event: "Password changed", userId: "U12345", ip: "192.168.1.102", date: "2023-11-10 13:47" },
    { id: "L45680", event: "Suspicious transaction attempt", userId: "U12347", ip: "192.168.1.45", date: "2023-11-09 20:33" },
    { id: "L45681", event: "User banned", userId: "U12347", ip: "192.168.1.203", date: "2023-11-09 20:40" },
    { id: "L45682", event: "Admin login", userId: "Admin", ip: "192.168.1.1", date: "2023-11-09 09:15" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "banned":
        return <Badge className="bg-red-500">Banned</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case "receive":
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case "stake":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "convert":
        return <ArrowUpDown className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4">
        <div className={`w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="h-2 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"></div>
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-gray-500 text-sm mt-1">
                Access the GCoin admin dashboard
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Log In to Admin Dashboard
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Demo credentials: adminuser / adminpassword123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />
      <Sidebar />
      
      <main className="pt-20 pb-16 px-4 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 text-gray-800 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Admin Dashboard
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Manage users, transactions, and monitor system activity
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className={`mb-8 transition-all duration-500 delay-300 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Tabs defaultValue="users">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="security">Security Logs</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-9 w-[220px]"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Active Users</DropdownMenuItem>
                      <DropdownMenuItem>Banned Users</DropdownMenuItem>
                      <DropdownMenuItem>Recently Added</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <Card>
                <TabsContent value="users" className="m-0">
                  <CardHeader className="pb-2">
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage user accounts, view details, and take administrative actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Added</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{user.date}</TableCell>
                            <TableCell>{user.balance} GCoin</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user.status === "active" ? (
                                  <Button variant="ghost" size="icon" className="text-red-500">
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="icon" className="text-green-500">
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="text-yellow-500">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="transactions" className="m-0">
                  <CardHeader className="pb-2">
                    <CardTitle>Transaction Management</CardTitle>
                    <CardDescription>
                      Monitor and manage all GCoin transactions in the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.userId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getTransactionTypeIcon(transaction.type)}
                                <span className="capitalize">{transaction.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{transaction.amount} GCoin</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getTransactionStatusIcon(transaction.status)}
                                {getStatusBadge(transaction.status)}
                              </div>
                            </TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="security" className="m-0">
                  <CardHeader className="pb-2">
                    <CardTitle>Security Logs</CardTitle>
                    <CardDescription>
                      View system security events and user activity logs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Log ID</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.id}</TableCell>
                            <TableCell>{log.event}</TableCell>
                            <TableCell>{log.userId}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                            <TableCell>{log.date}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
          </div>
          
          <div className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-500 delay-400 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Activity Calendar</span>
                  <Calendar className="h-5 w-5 text-gray-500" />
                </CardTitle>
                <CardDescription>
                  User registration and transaction activity
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Calendar visualization coming soon</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>System Notifications</span>
                  <Bell className="h-5 w-5 text-gray-500" />
                </CardTitle>
                <CardDescription>
                  Recent system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Bell className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Transaction Spike Detected</p>
                      <p className="text-xs text-gray-500">System detected an unusual number of transactions in the last hour.</p>
                      <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Multiple Failed Login Attempts</p>
                      <p className="text-xs text-gray-500">User U12347 experienced multiple failed login attempts.</p>
                      <p className="text-xs text-gray-400 mt-1">45 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New User Registration</p>
                      <p className="text-xs text-gray-500">10 new users registered in the last 24 hours.</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
