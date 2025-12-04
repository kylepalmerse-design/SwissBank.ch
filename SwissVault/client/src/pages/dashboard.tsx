import { useEffect, useState } from 'react';
import { useRouter } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading ] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setLoading(false);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Твои карты счетов — добавь код из твоего проекта */}
        <Card>
          <CardHeader>
            <CardTitle>Private Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p>IBAN: CH31 0833 9000 9876 5432 1</p>
            <p>Balance: 1,850,000 CHF</p>
            <Button onClick={() => router.push('/transfer?account=private')}>Transfer</Button>
          </CardContent>
        </Card>
        {/* Добавь другие счета аналогично */}
      </div>
    </div>
  );
}