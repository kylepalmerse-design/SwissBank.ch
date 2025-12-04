import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatIBAN } from "@/lib/utils-format";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Accounts() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (!user && !isLoading) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName={user?.name} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" data-testid="text-page-title">
          Accounts Overview
        </h1>

        <div className="space-y-8">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-md" />
              ))}
            </>
          ) : (
            user?.accounts.map((account) => {
              const accountTransactions = user.transactions
                .filter((tx) => tx.accountId === account.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);

              return (
                <Card key={account.id} data-testid={`account-detail-${account.id}`}>
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl">{account.type}</CardTitle>
                        <p className="text-sm font-mono text-muted-foreground">
                          {formatIBAN(account.iban)}
                        </p>
                        {account.type === "Savings Account" && (
                          <div className="flex items-center gap-1 text-sm text-primary">
                            <TrendingUp className="h-4 w-4" />
                            <span>2.15% annual interest</span>
                          </div>
                        )}
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-3xl font-bold tracking-tight" data-testid={`text-balance-${account.id}`}>
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                    {accountTransactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No transactions yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {accountTransactions.map((transaction) => {
                          const isIncoming = transaction.type === "incoming";
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between gap-4 p-3 rounded-md hover-elevate active-elevate-2 transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`rounded-full p-1.5 shrink-0 ${
                                  isIncoming 
                                    ? "bg-chart-2/10 text-chart-2" 
                                    : "bg-destructive/10 text-destructive"
                                }`}>
                                  {isIncoming ? (
                                    <ArrowDownLeft className="h-4 w-4" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {transaction.counterpartyName || "Transfer"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {transaction.reference || formatIBAN(transaction.counterpartyIban)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-semibold ${
                                  isIncoming ? "text-chart-2" : "text-destructive"
                                }`}>
                                  {isIncoming ? "+" : "-"}{formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
