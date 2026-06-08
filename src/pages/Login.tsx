import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { user, signIn, demoMode } = useAuth();
  const [email, setEmail] = useState('cabo.dia@quartel.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center screen-gradient px-4 py-8 text-white">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-lg bg-operacional-fire">
            <ShieldCheck size={34} />
          </div>
          <p className="text-sm font-semibold uppercase text-operacional-accent">Corpo de Bombeiros</p>
          <h1 className="mt-2 text-3xl font-black">CD Digital</h1>
          <p className="mt-2 text-slate-300">Gestão de Prontidão Operacional</p>
        </div>
        <Card>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <FormInput label="E-mail operacional" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <FormInput label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={demoMode ? 'Opcional no modo demonstração' : 'Senha do Supabase Auth'} />
            {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
            {demoMode && <p className="rounded-lg bg-yellow-400/10 p-3 text-sm text-yellow-100">Supabase não configurado. O login entra em modo demonstração local.</p>}
            <Button disabled={loading}>{loading ? 'Entrando...' : 'Entrar no plantão'}</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
