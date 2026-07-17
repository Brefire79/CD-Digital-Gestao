# Design QA — Menu pós-login

## Comparação

- Fonte visual verdadeira: `C:\PROJETOS\CD-Digital-Gestao\docs\references\troca-sv-menu-pos-login.png`
- Implementação: `http://127.0.0.1:5173/passagem-servico`
- Screenshot da implementação: indisponível porque a conexão com o navegador interno falhou com `Cannot redefine property: process`.
- Viewport de referência: `435 × 592 px`.
- Estado: usuário autenticado, menu principal da Troca de SV Digital.

## Superfícies verificadas

- Tipografia: Barlow Condensed no título e Inter na interface, com pesos e tamanhos ajustados ao mockup.
- Espaçamento e ritmo: moldura pós-login de 388 px, altura útil responsiva, cabeçalho de 83 px, rodapé de 36 px, cinco cartões com 11 px de intervalo.
- Cores: vermelho `#B3181F`, azul-claro `#D9EEFA`, azul `#2E9BE6`/`#0F5C99` e amarelo `#F1C24B`.
- Imagem: brasão oficial fornecido pelo usuário, sem substituição por desenho ou placeholder.
- Conteúdo: ordem e textos idênticos ao modelo — Viaturas, Ronda Quartel, Escala de Hora, Livro dos Motoristas e Relatórios.

## Histórico de correções

### Iteração 1

- [P1] A tela ocupava toda a largura abaixo de 640 px, enquanto o modelo usa uma moldura arredondada com margem cinza.
  - Correção: criadas as classes `passagem-menu-stage` e `passagem-menu-device`, aplicadas apenas ao menu pós-login.
- [P2] Cabeçalho, logo e cartões estavam maiores e mais espaçados do que a referência de 435 × 592 px.
  - Correção: cabeçalho reduzido para 83 px, brasão para 44 px, cartões para grade proporcional com 11 px de intervalo e rodapé para 36 px.
- [P2] O menu crescia pela regra genérica de desktop e perdia a proporção do mockup.
  - Correção: override específico preserva 388 px de largura e até 844 px de altura sem alterar as telas operacionais.

## Evidência de comparação

- Comparação de tela inteira: medidas e composição foram conferidas contra a imagem de 435 × 592 px.
- Comparação focada: cabeçalho, selo de prontidão, cartões e rodapé foram medidos separadamente.
- Evidência visual pós-correção: bloqueada; não foi possível capturar o navegador interno.

## Validação técnica

- `tsc -b`: aprovado.
- Build Vite/PWA: aprovado.
- Rota local: HTTP 200.

## Atualização pontual — Viaturas

- Fonte visual: `C:\PROJETOS\CD-Digital-Gestao\docs\references\troca-sv-viaturas-revisao.png`.
- Texto corrigido para informar que o Sgt e o Cb de Dia podem revisar os postos.
- Campo funcional `Telegrafista do plantão` incluído na aba Viaturas.
- Ao adicionar, o policial é salvo no cabeçalho e na guarnição como `Telegrafista`, com exclusão da rotação automática e reutilização nos horários fixos da Escala de Hora e no documento.
- A captura visual pós-correção continua indisponível pelo mesmo bloqueio do navegador interno.

## Bloqueador restante

A captura visual da implementação no mesmo viewport não está disponível. Sem essa evidência não é possível declarar a comparação visual aprovada, mesmo com os ajustes de código e medidas concluídos.

final result: blocked

## Atualização pontual — Livro dos Motoristas

- Fonte visual: `C:\Users\BRENO-~1\AppData\Local\Temp\codex-clipboard-e4f6d5cb-7cc5-4473-8083-2ac3d0616a3d.png`.
- Cabeçalho ajustado para quatro linhas: Polícia Militar do Estado de São Paulo, Corpo de Bombeiros, Estação de Bombeiros Ipiranga e `Prontidão - data por extenso`.
- O mesmo cabeçalho foi aplicado ao PDF próprio do Livro dos Motoristas.
- As VTRs do plantão são sincronizadas com o Livro; VTRs administrativas, estacionadas e de pernoite podem ser adicionadas somente ao Livro.
- C/N exige relato antes do fechamento. O Livro continua editável até a revisão e assinatura do Chefe dos Motoristas.
- O encerramento depende da confirmação do upload em `Prontidão correspondente/Livro dos Motoristas/Ano` no Google Drive; uma falha mantém o Livro aberto e a pendência ativa.
- Validação técnica após a alteração: `tsc -b` e build Vite/PWA aprovados; rota local `/passagem-servico` respondeu HTTP 200.
- A validação visual comparativa pós-correção permanece bloqueada pela indisponibilidade de captura do navegador interno já registrada acima.
