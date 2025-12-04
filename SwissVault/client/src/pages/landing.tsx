import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <header className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight" data-testid="text-logo">
            <span className="text-foreground">Helvetia</span>
            <span className="text-primary ml-1">Private Bank</span>
          </h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground">
              Wealth Management
              <br />
              <span className="text-muted-foreground">Refined</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discreet banking services tailored to your needs. Experience Swiss precision in wealth preservation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="gap-2 min-w-[200px]"
                data-testid="button-client-login"
              >
                Client Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Discretion</h3>
              <p className="text-sm text-muted-foreground">
                Your financial privacy is our paramount concern. Swiss banking tradition.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Personalized wealth management strategies tailored to your objectives.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art protection for your assets and information.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="p-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Helvetia Private Bank. Regulated by FINMA.</p>
        </div>
      </footer>
    </div>
  );
}
