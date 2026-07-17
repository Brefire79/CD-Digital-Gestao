# PRD - CD Digital - Gestão de Prontidão Operacional

## Estado atual

O CD Digital é um PWA mobile first em React, TypeScript e Vite para o plantão de 24 horas. Possui autenticação Supabase com modo demonstrativo local, contexto operacional persistido, fluxo Passagem 360 em Zustand, geração de PDFs e integração OAuth com Google Drive para o fechamento do Livro dos Motoristas.

Fontes principais:

- `src/contexts/OperationalContext.tsx`: escalas, viaturas, setores, pendências e histórico operacional.
- `src/store/passagem.ts`: estado e ciclo da Passagem 360.
- `src/lib/escalaGenerator.ts`: escala horária e rondantes.
- `src/lib/livroMotoristasPdf.ts`: PDF próprio do Livro.
- `src/lib/googleDrive.ts`: autenticação e backup no Google Drive.
- `supabase/schema.sql`: persistência, RLS, gatilhos e auditoria do banco.

## Objetivo

Digitalizar a troca de serviço e a gestão da prontidão, reduzindo papel, retrabalho e perda de histórico entre as prontidões Amarela, Azul e Verde.

## Usuários

- Administrador.
- Sargento da Prontidão.
- Cabo de Dia.
- Chefe dos Motoristas.
- Militar operacional.

## Fluxo principal pós-login

1. Viaturas.
2. Ronda Quartel.
3. Escala de Hora.
4. Livro dos Motoristas.
5. Relatórios.

## Regras de Viaturas

- Sgt da Prontidão, Cabo de Dia e Chefe dos Motoristas podem informar ou revisar as viaturas do plantão.
- Cada viatura usa os postos CMT, MOT, AUX e Estagiário.
- O Telegrafista é cadastrado na aba Viaturas como função independente e reutilizado nos horários fixos e documentos.
- Classes operacionais: Incêndio (`ABS`, `AB`, `AT`), Resgate (`UR`, `USA`), Canil (`UT`, `VO`) e OD.
- A OD aparece apenas como informação e não participa automaticamente da escala horária ou da ronda.

## Regras da Escala de Hora

- Apenas Sd e Cb das VTRs UR, ABS/AB e Canil entram automaticamente.
- Sgt e Oficiais não entram automaticamente.
- O início noturno é escolhido pelo Cabo de Dia: 22h00 ou 23h00.
- Se começar às 23h00, 22h00-23h00 pertence ao Telegrafista.
- 06h00-07h30 pertence sempre ao Telegrafista.
- A prioridade inicial é Motorista do Resgate, Motorista do Incêndio e Motorista do Canil.
- Os demais horários alternam integrantes de Incêndio, Resgate e Canil, evitando dois integrantes da mesma guarnição em sequência quando houver alternativa.
- Almoço, manutenção, rancho, Paineiras e demais tarefas podem ser revisados pelo Cabo de Dia.
- O Cabo de Dia pode alterar qualquer resultado automático antes da assinatura.

## Rondantes

- Período fixo de 00h00 a 06h00.
- Apenas Sgt participa automaticamente.
- Sgt vinculado à OD não participa.
- Um Sgt cobre todo o período; dois ou mais dividem as faixas.
- O Cabo de Dia pode revisar a divisão.

## Livro dos Motoristas

- Replica automaticamente as VTRs cadastradas no início do plantão.
- Permite adicionar VTR administrativa, estacionada no quartel, de pernoite ou outra VTR adicional.
- Cada VTR é marcada como `S/N` ou `C/N`.
- `C/N` abre campo obrigatório para relato e cria pendência.
- O Livro permanece editável até o término do plantão.
- O cabeçalho oficial usa quatro linhas:
  - Polícia Militar do Estado de São Paulo.
  - Corpo de Bombeiros.
  - Estação de Bombeiros Ipiranga.
  - `Prontidão - data por extenso`.
- O Chefe dos Motoristas revisa e confirma a assinatura eletrônica.
- O encerramento é bloqueado quando houver C/N sem relato, ausência do responsável ou falha no backup.
- O app gera um PDF próprio e salva em `Prontidão correspondente/Livro dos Motoristas/Ano` no Google Drive.
- Arquivo do mesmo plantão é substituído, evitando duplicidade.
- Somente depois do backup confirmado o Livro é encerrado, a pendência é resolvida e o próximo plantão pode iniciar limpo.

## Integração Google Drive

- Variável pública: `VITE_GOOGLE_CLIENT_ID`.
- Escopo OAuth: `https://www.googleapis.com/auth/drive.file`.
- É necessário habilitar Google Drive API e cadastrar as origens autorizadas do app no cliente OAuth Web.
- Nenhum client secret deve ser colocado no frontend.
- Sem configuração ou autorização, o Livro continua aberto e exibe erro operacional.

## Critérios de aceite

- Cabeçalho e prontidão correspondem ao dia do plantão.
- VTRs do plantão aparecem no Livro sem recadastro.
- VTR adicional não altera a escala operacional.
- C/N sem relato impede o encerramento.
- Falha do Drive impede encerramento e preserva os dados.
- Sucesso do Drive registra caminho, ID e link retornados pela API.
- Histórico local preserva o Livro encerrado.
- `tsc -b` e build Vite passam sem erros.

## Pendências para produção

- Configurar o cliente OAuth e testar upload em uma conta Google real.
- Completar a persistência Supabase dos fluxos que ainda usam fallback local.
- Revisar RLS antes da publicação.
- Executar QA visual mobile e teste completo de troca de plantão.
