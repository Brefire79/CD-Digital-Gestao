import { usePassagem } from '../store/passagem';
import { WizardLayout } from '../components/passagem/WizardLayout';
import { StepVTR } from '../components/passagem/StepVTR';
import { StepGuarnicao } from '../components/passagem/StepGuarnicao';
import { StepRondas } from '../components/passagem/StepRondas';
import { StepEscala } from '../components/passagem/StepEscala';
import { StepLivro } from '../components/passagem/StepLivro';
import { StepReview } from '../components/passagem/StepReview';
import { PassagemMenu } from '../components/passagem/PassagemMenu';

export function PassagemServico() {
  const step = usePassagem((s) => s.step);
  const tela = usePassagem((s) => s.tela);

  if (tela === 'menu') return <PassagemMenu />;

  return (
    <WizardLayout>
      {step === 0 && <StepVTR />}
      {step === 1 && <StepGuarnicao />}
      {step === 2 && <StepRondas />}
      {step === 3 && <StepEscala />}
      {step === 4 && <StepLivro />}
      {step === 5 && <StepReview />}
    </WizardLayout>
  );
}
