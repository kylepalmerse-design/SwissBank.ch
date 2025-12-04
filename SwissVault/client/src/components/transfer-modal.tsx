import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, type TransferRequest, type Account } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatIBAN } from "@/lib/utils-format";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  defaultAccountId?: string;
}

export function TransferModal({ open, onOpenChange, accounts, defaultAccountId }: TransferModalProps) {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const form = useForm<TransferRequest>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: defaultAccountId || "",
      recipientIban: "",
      recipientName: "",
      amount: 0,
      reference: "",
    },
  });

  useEffect(() => {
    if (defaultAccountId) {
      form.setValue("sourceAccountId", defaultAccountId);
    }
  }, [defaultAccountId, form]);

  const transferMutation = useMutation({
    mutationFn: async (data: TransferRequest) => {
      const response = await apiRequest("POST", "/api/transfers", data);
      return response;
    },
    onSuccess: (data) => {
      setSuccess(true);
      
      // Show confetti effect
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#E5E4E2', '#FFD700'],
            disableForReducedMotion: true,
          });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Transfer successful",
        description: data.isInternal 
          ? "Funds transferred instantly" 
          : "Transfer initiated successfully",
      });

      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        form.reset();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Transfer failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const selectedAccount = accounts.find(
    (acc) => acc.id === form.watch("sourceAccountId")
  );

  const calculateFee = (iban: string): number => {
    if (!iban) return 0;
    // Note: This is an estimate. Server will calculate actual fee based on:
    // - Internal transfers (to other users) = CHF 0
    // - External Swiss IBAN = CHF 12
    // - International IBAN = CHF 25
    return iban.startsWith("CH") ? 12 : 25;
  };

  const recipientIban = form.watch("recipientIban");
  const amount = form.watch("amount");
  const fee = calculateFee(recipientIban);

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Transfer Successful</h3>
              <p className="text-sm text-muted-foreground">
                Your transfer has been processed
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Transfer</DialogTitle>
          <DialogDescription>
            Transfer funds securely via SEPA or international wire
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => transferMutation.mutate(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="sourceAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-source-account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.type} - {formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAccount && (
                    <FormDescription className="font-mono text-xs">
                      {formatIBAN(selectedAccount.iban)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipientIban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient IBAN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="CH93 0000 0000 0000 0000 0"
                        className="font-mono"
                        data-testid="input-recipient-iban"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., John Smith"
                        data-testid="input-recipient-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (CHF)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Payment reference or message"
                      className="resize-none"
                      rows={2}
                      data-testid="input-reference"
                    />
                  </FormControl>
                  <FormDescription>
                    Max 140 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {amount > 0 && (
              <div className="bg-muted/50 rounded-md p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transfer amount</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">{formatCurrency(fee)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(amount + fee)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                className="flex-1"
                data-testid="button-cancel-transfer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={transferMutation.isPending}
                className="flex-1"
                data-testid="button-confirm-transfer"
              >
                {transferMutation.isPending ? "Processing..." : "Confirm Transfer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
