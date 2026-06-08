import { Navigate, Route, Routes } from 'react-router-dom';
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

function PrivateRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Carregando prontidão...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route index element={<Dashboard />} />
        <Route path="/escala-dia" element={<EscalaDia />} />
        <Route path="/escala-horaria" element={<EscalaHoraria />} />
        <Route path="/passagem-servico" element={<PassagemServico />} />
        <Route path="/checklist-quartel" element={<PassagemServico />} />
        <Route path="/livro-motoristas" element={<LivroMotoristas />} />
        <Route path="/relato-viaturas" element={<LivroMotoristas />} />
        <Route path="/pendencias" element={<Pendencias />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/viaturas" element={<Viaturas />} />
        <Route path="/setores" element={<Setores />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
