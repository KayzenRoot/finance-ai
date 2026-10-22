# Requisitos

Status: requisitos V1; M00 seleciona e prova o caminho de autenticação, enquanto saldos cripto ficam para M11.

## Funcionais

- REQ-FIN-001 — Manter espaços Pessoal e Loja isolados; apresentar transferências vinculadas sem dupla contagem.
- REQ-FIN-002 — Cadastrar contas bancárias, dinheiro em caixa e cartões com saldo inicial, data de referência e estado.
- REQ-FIN-003 — Registrar entradas, saídas, transferências, categorias e recorrências.
- REQ-FIN-004 — Gerir contas a pagar e receber com valor, vencimento, recorrência, status e origem.
- REQ-FIN-005 — Manter dívidas com saldo informado, vencimento, mínimo, juros/CET, multa e consequências conhecidas.
- REQ-FIN-006 — Projetar fluxo de caixa por data usando saldos, compromissos e recebimentos com confiança explícita.
- REQ-FIN-007 — Comparar cenários de pagamento e mostrar saldo remanescente, custos conhecidos, insuficiências e dados ausentes.
- REQ-FIN-008 — Produzir uma lista explicável de prioridades sem efetuar pagamentos.
- REQ-FIN-009 — Importar extratos CSV com mapeamento, prévia, detecção de duplicidade e confirmação antes de gravar.
- REQ-FIN-010 — Permitir consultas em linguagem natural sobre dados armazenados e autorizados.
- REQ-FIN-011 — Permitir que a IA prepare rascunhos de lançamentos; salvar somente após confirmação explícita do titular.
- REQ-FIN-012 — Exportar os dados do titular em formato legível e utilizável.
- REQ-CRYPTO-001 — Oferecer login com carteira via Supabase Auth Web3 (SIWE para Ethereum/EVM e SIWS para Solana), preservando autorização do titular e RLS; Privy só se houver necessidade futura comprovada.
- REQ-CRYPTO-002 — Importar saldos de redes suportadas em modo leitura, com refresh e entrada manual para fontes indisponíveis.
- REQ-CRYPTO-003 — Mostrar rede, ativo, quantidade, fonte de preço, horário da observação e estado de desatualização.
- REQ-CRYPTO-004 — Manter criptoativos separados do caixa disponível e não tratá-los como dinheiro pronto para pagar contas.
- REQ-CRYPTO-005 — Desvincular a carteira e remover os dados associados conforme a política de exportação/exclusão.

## Segurança e qualidade

- REQ-SEC-001 — Nenhum dado financeiro real, segredo, credencial ou identificador pessoal em repositório público, issues, fixtures ou logs.
- REQ-SEC-002 — Toda leitura e escrita é autorizada no servidor e vinculada ao titular e ao espaço financeiro.
- REQ-SEC-003 — A arquitetura suporta criptografia em trânsito/em repouso, gestão segura de segredos, exportação e exclusão.
- REQ-SEC-004 — IA e integrações não efetuam pagamentos, iniciam transações, contratam crédito ou alteram registros sem confirmação.
- REQ-SEC-005 — Valores em BRL usam aritmética decimal exata.
- REQ-SEC-006 — Todas as tabelas expostas do Supabase que contenham dados financeiros têm RLS e políticas de proprietário testadas contra IDOR.
- REQ-REL-001 — Importações são idempotentes ou oferecem revisão de duplicidades antes de salvar.
- REQ-REL-002 — Falhas de integração não apagam lançamentos confirmados.
- REQ-REL-003 — PRs passam CI de qualidade, testes e segurança antes do merge.
- REQ-UX-001 — A aplicação funciona em celular e computador e explica termos financeiros sem exigir conhecimento técnico.

## Critérios transversais

Cada recomendação identifica período, dados usados, premissas, limitações, confiança e motivo da prioridade. Dados insuficientes geram pergunta ou ressalva explícita. Criptoativos mostram valor estimado e data da fonte, nunca disponibilidade garantida.
