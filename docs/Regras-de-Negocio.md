# Regras de Negócio - CD Digital

## Prontidões e plantão

- Prontidões: Amarela, Azul e Verde.
- Regime: 24x48, das 07h30 às 07h30 do dia seguinte.
- Data e prontidão são calculadas para o dia do serviço.
- Alteração assinada substitui a versão anterior do mesmo turno, preservando histórico.

## Viaturas e guarnições

- Funções por VTR: CMT, MOT, AUX e Estagiário.
- Telegrafista é uma função independente cadastrada na aba Viaturas.
- Sgt da Prontidão, Cabo de Dia e Chefe dos Motoristas podem informar ou revisar VTRs.
- Incêndio: ABS, AB e AT. Resgate: UR e USA. Canil: UT e VO. OD: informativa.
- A litragem e o prefixo podem variar conforme a viatura.
- OD não participa automaticamente da escala horária ou da ronda.

## Escala de Hora

- Apenas Sd e Cb das VTRs UR, ABS/AB e Canil entram automaticamente.
- Sgt e Oficiais ficam fora da escala automática.
- O Cabo de Dia escolhe início às 22h00 ou 23h00.
- Com início às 23h00, 22h00-23h00 fica com o Telegrafista.
- 06h00-07h30 fica sempre com o Telegrafista.
- Ordem inicial: Motorista do Resgate, Motorista do Incêndio e Motorista do Canil.
- Depois, alternar Incêndio, Resgate e Canil, evitando repetição consecutiva da mesma guarnição quando possível.
- Se o motorista do Canil for Sgt, ele não entra na escala horária; outro integrante elegível assume a posição.
- O Cabo de Dia pode modificar horários, militares, almoço e tarefas.

## Rondantes

- Ronda entre 00h00 e 06h00.
- Apenas Sgt participa automaticamente.
- Sgt da OD é excluído.
- Um Sgt cobre todo o período; dois ou mais dividem as faixas.
- O Cabo de Dia pode revisar a divisão.

## Livro dos Motoristas

- As VTRs do plantão são sincronizadas automaticamente.
- VTR administrativa, estacionada, de pernoite ou adicional pode ser incluída somente no Livro.
- O Livro permanece aberto e editável durante o plantão.
- `S/N` significa sem novidades.
- `C/N` exige relato e cria pendência.
- Cabeçalho: Polícia Militar do Estado de São Paulo; Corpo de Bombeiros; Estação de Bombeiros Ipiranga; `Prontidão - data por extenso`.
- O Chefe dos Motoristas revisa e assina ao fim do plantão.
- C/N sem relato, responsável ausente ou backup não confirmado impede o encerramento.
- O PDF é salvo em `Prontidão correspondente/Livro dos Motoristas/Ano`.
- O mesmo nome de arquivo no mesmo plantão é substituído.
- Somente upload confirmado permite encerrar, resolver a pendência e liberar o próximo plantão.

## Pendências e histórico

- Checklist com alteração cria pendência.
- C/N cria pendência vinculada à viatura.
- Fechamento do Livro cria pendência para o Chefe dos Motoristas.
- Mudança de status registra histórico.
- Livros e plantões encerrados permanecem consultáveis.

## Segurança

- Nunca expor Supabase `service_role`, Google client secret, tokens ou senhas.
- Usar apenas `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_GOOGLE_CLIENT_ID` no frontend.
- Revisar RLS antes de produção.
