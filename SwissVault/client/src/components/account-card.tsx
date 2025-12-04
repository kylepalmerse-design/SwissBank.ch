import { type Account } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatIBAN } from "@/lib/utils-format";
import { ArrowUpRight, History } from "lucide-react";
import { AccountSparkline } from "./account-sparkline";

interface AccountCardProps {
  account: Account;
  onTransfer: (accountId: string) => void;
  onViewTransactions: (accountId: string) => void;
}

export function AccountCard({ account, onTransfer, onViewTransactions }: AccountCardProps) {
  return (
    <Card 
      className="group hover-elevate active-elevate-2 transition-all duration-200 bg-card/50 backdrop-blur-sm border-card-border overflow-visible"
      data-testid={`card-account-${account.id}`}
    >
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {account.type}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {formatIBAN(account.iban)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid={`text-balance-${account.id}`}>
            {formatCurrency(account.balance)}
          </div>
        </div>

        <AccountSparkline accountId={account.id} />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onTransfer(account.id)}
            data-testid={`button-transfer-${account.id}`}
          >
            Transfer
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onViewTransactions(account.id)}
            data-testid={`button-transactions-${account.id}`}
          >
            History
            <History className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
