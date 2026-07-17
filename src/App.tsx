import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { EscalaDia } from './pages/EscalaDia';
import { EscalaHoraria } from './pages/EscalaHoraria';
import { LivroMotoristas } from './pages/LivroMotoristas';
import { Login } from './pages/Login';
import { PassagemServico } from './pages/PassagemServico';
import { Pendencias } from './pages/Pendencias';
import { Relatorios } from './pages/Relatorios';
import { Setores } from './pages/Setores';
import { Viaturas } from './pages/Viaturas';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-charcoal text-white">Carregando prontidão...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        {/* Passagem 360 — experiência operacional em tela cheia */}
        <Route path="/passagem-servico" element={<PassagemServico />} />
        {/* Demais telas usam o layout padrão com navbar */}
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/escala-dia" element={<EscalaDia />} />
          <Route path="/escala-horaria" element={<EscalaHoraria />} />
          <Route path="/checklist-quartel" element={<Navigate to="/passagem-servico" replace />} />
          <Route path="/livro-motoristas" element={<LivroMotoristas />} />
          <Route path="/relato-viaturas" element={<LivroMotoristas />} />
          <Route path="/pendencias" element={<Pendencias />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/viaturas" element={<Viaturas />} />
          <Route path="/setores" element={<Setores />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
