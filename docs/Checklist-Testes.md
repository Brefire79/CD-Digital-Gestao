# Checklist de Testes - CD Digital

## Validação técnica

- [x] `tsc -b` sem erros.
- [x] Build Vite/PWA sem erros.
- [x] `/passagem-servico` responde HTTP 200 localmente.
- [ ] QA visual comparativo no mesmo viewport dos modelos.
- [ ] Rotas protegidas testadas com e sem sessão.

## Data e prontidão

- [ ] 17/07/2026 retorna Azul.
- [ ] Cabeçalho exibe `Azul - 17 de Julho de 2026`.
- [ ] Mudança de dia atualiza data e prontidão.

## Viaturas

- [ ] Adicionar Incêndio, Resgate, Canil e OD.
- [ ] Cada VTR abre CMT, MOT, AUX e Estagiário.
- [ ] Telegrafista é salvo como função independente.
- [ ] Sgt e Cb de Dia conseguem revisar os postos.
- [ ] OD não entra na escala ou ronda automática.

## Escala de Hora

- [ ] Apenas Sd/Cb elegíveis entram automaticamente.
- [ ] Início 23h cria 22h-23h com Telegrafista.
- [ ] 06h-07h30 fica com Telegrafista.
- [ ] Ordem inicial respeita MOT Resgate, MOT Incêndio e MOT Canil.
- [ ] Integrantes das guarnições são alternados quando possível.
- [ ] Sgt do Canil não entra automaticamente na escala horária.
- [ ] Cabo de Dia consegue alterar qualquer linha.

## Rondantes

- [ ] Um Sgt cobre 00h-06h.
- [ ] Dois Sgt dividem o período.
- [ ] Sgt da OD é excluído.
- [ ] Divisão permanece editável.

## Livro dos Motoristas

- [ ] Replica as VTRs do plantão.
- [ ] Remover VTR do plantão remove sua linha sem apagar VTR adicional.
- [ ] Adicionar VTR administrativa, estacionada e de pernoite.
- [ ] VTR adicional não entra na escala operacional.
- [ ] C/N abre relato.
- [ ] C/N vazio impede encerramento.
- [ ] Livro aberto permite edição até o fim do plantão.
- [ ] Cabeçalho possui as quatro linhas oficiais.
- [ ] Chefe dos Motoristas e confirmação são obrigatórios.

## Google Drive

- [ ] Sem `VITE_GOOGLE_CLIENT_ID`, mostra erro e mantém Livro aberto.
- [ ] Recusar OAuth mantém Livro e pendência abertos.
- [ ] Cria/localiza `Prontidão Azul/Livro dos Motoristas/2026`.
- [ ] PDF usa cabeçalho e dados reais.
- [ ] Segundo envio do mesmo plantão substitui o arquivo.
- [ ] Sucesso registra ID, link, caminho e nome do arquivo.
- [ ] Somente sucesso encerra o Livro e resolve a pendência.
- [ ] Próximo plantão inicia limpo e preserva histórico anterior.

## Supabase e segurança

- [ ] RLS revisada por perfil.
- [ ] Nenhum secret ou token versionado.
- [ ] Pendências e fechamento persistem entre dispositivos.
- [ ] Migração do estado local antigo não perde registros.
