import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type User, type Transaction } from "@shared/schema";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, formatIBAN } from "@/lib/utils-format";
import { ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { useLocation } from "wouter";

export default function Transactions() {
  const [location, setLocation] = useLocation();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    // Get account ID from query parameter if present
    const params = new URLSearchParams(location.split("?")[1] || "");
    return params.get("account") || "all";
  });

  // Update selectedAccountId when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const accountId = params.get("account") || "all";
    setSelectedAccountId(accountId);
  }, [location]);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (!user && !isLoading) {
    setLocation("/login");
    return null;
  }

  const filteredTransactions = user?.transactions.filter((tx) => {
    if (selectedAccountId === "all") return true;
    return tx.accountId === selectedAccountId;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header userName={user?.name} />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" data-testid="text-page-title">
            Transactions
          </h1>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-[200px]" data-testid="select-filter-account">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {user?.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </>
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No transactions found</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncoming = transaction.type === "incoming";

  return (
    <Card 
      className="hover-elevate active-elevate-2 transition-all overflow-visible"
      data-testid={`transaction-${transaction.id}`}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`rounded-full p-2 shrink-0 ${
            isIncoming 
              ? "bg-chart-2/10 text-chart-2" 
              : "bg-destructive/10 text-destructive"
          }`}>
            {isIncoming ? (
              <ArrowDownLeft className="h-5 w-5" />
            ) : (
              <ArrowUpRight className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-foreground truncate">
              {transaction.counterpartyName || "Transfer"}
            </p>
            <p className="text-sm text-muted-foreground font-mono truncate">
              {formatIBAN(transaction.counterpartyIban)}
            </p>
            {transaction.reference && (
              <p className="text-xs text-muted-foreground truncate">
                {transaction.reference}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <p className={`font-semibold text-lg ${
            isIncoming ? "text-chart-2" : "text-destructive"
          }`}>
            {isIncoming ? "+" : "-"}{formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date)}
          </p>
          {transaction.fee > 0 && (
            <p className="text-xs text-muted-foreground">
              Fee: {formatCurrency(transaction.fee)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
