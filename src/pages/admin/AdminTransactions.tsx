
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: string;
  status: string;
  description?: string;
  fee?: number;
}

const AdminTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error);
          toast({
            title: "Error",
            description: "Failed to load transactions",
            variant: "destructive"
          });
          return;
        }

        setTransactions(data || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{formatNumber(transaction.amount)}</TableCell>
                  <TableCell>{transaction.sender}</TableCell>
                  <TableCell>{transaction.recipient}</TableCell>
                  <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatNumber(transaction.fee || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
