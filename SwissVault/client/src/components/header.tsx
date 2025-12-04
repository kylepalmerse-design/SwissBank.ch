import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
      });
      setLocation("/login");
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <button 
              className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md transition-all"
              data-testid="link-logo"
            >
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Helvetia
              </span>
              <span className="text-lg font-semibold tracking-tight text-primary">
                Private Bank
              </span>
            </button>
          </Link>

          {userName && (
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/transactions">Transactions</NavLink>
              <NavLink href="/accounts">Accounts</NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-contacts"
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Contacts</span>
                  <Mail className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Helvetia Private Bank</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="text-foreground font-medium">info@helvetiaprivatebank.ch</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Address</p>
                        <p className="text-foreground font-medium">
                          Münster Tower<br />
                          Münsterplatz 12<br />
                          4001 Basel, Switzerland
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <ThemeToggle />
          {userName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <button
        className={`text-sm font-medium transition-colors hover:text-foreground px-3 py-2 rounded-md hover-elevate active-elevate-2 ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
        data-testid={`link-${href.replace("/", "")}`}
      >
        {children}
      </button>
    </Link>
  );
}
