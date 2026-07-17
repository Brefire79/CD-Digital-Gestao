import type { Perfil } from '../../store/passagem';

// Inferência de perfil a partir do login militar.
// - sgt / sargento            -> Sgt (inicia em VTR/Guarnição)
// - cabo / cb / cabo.dia      -> Cabo de Dia (inicia na Ronda, pode voltar)
// - demais                    -> operacional
export function inferirPerfil(login: string): Perfil {
  const l = login.trim().toLowerCase();
  if (l.includes('sgt') || l.includes('sargento')) return 'sgt';
  if (l.includes('cabo') || /(^|[^a-z])cb([^a-z]|$)/.test(l)) return 'cabo_dia';
  return 'operacional';
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  sgt: 'Sgt',
  cabo_dia: 'Cabo de Dia',
  operacional: 'Operacional'
};
