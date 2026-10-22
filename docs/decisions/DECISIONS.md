# Registro de decisões

Estado: decisões conceituais 001–004 aprovadas em conversa; direção de Supabase aprovada pelo titular; demais propostas aguardam ADR/revisão.

| ID | Decisão | Estado | Motivo / consequência |
|---|---|---|---|
| DEC-001 | V1 para um único titular; multiusuário fora. | Aprovada | Mantém o primeiro corte pequeno e privado. |
| DEC-002 | Pessoal e Loja são espaços separados; transferência interna vinculada e neutralizada no consolidado. | Aprovada | Evita mistura e dupla contagem. |
| DEC-003 | Começar com entrada manual e CSV; Open Finance fora da V1. | Aprovada | Permite começar sem depender de parceiro e elegibilidade. |
| DEC-004 | IA explica e prepara rascunhos; cálculo é determinístico; não há pagamento automático. | Aprovada | Mantém controle do titular e resultados reproduzíveis. |
| DEC-005 | Locale inicial pt-BR/BRL. | Proposta | Adequado ao uso informado; validar na implementação. |
| DEC-006 | Framework, LLM, hospedagem e detalhes finais de autenticação por ADR no M00. | Proposta / gate | Evita assumir custo ou fluxo de dados sem validação. |
| DEC-007 | Aplicação web responsiva. | Proposta | Atende telefone e computador. |
| DEC-008 | Repositório público não recebe dados reais, segredos, endereços de carteira do titular ou fixtures identificáveis. | Regra aprovada | Protege dados sensíveis. |
| DEC-009 | Risco do produto ELEVATED por dados financeiros e apoio à decisão. | Proposta | Exige testes de segurança e recuperação. |
| DEC-010 | Supabase Postgres será o banco de dados da aplicação. | Aprovada pelo titular em 2026-10-22 | Migrações versionadas e RLS são requisitos. Plano Free pode pausar após inatividade e não inclui backup diário; verificar preço vigente e backup independente. |
| DEC-011 | Privy é o candidato solicitado para login com carteira e gestão/vinculação de carteiras. | Proposta / prova M00 | Confirmar SIWE/SIWS, integração com Supabase, RLS, privacidade e plano Developer antes de produção. |
| DEC-012 | Cloudinary fica condicionado a uma funcionalidade real de imagem. | Aprovada como condição | V1 atual não usa anexos/imagens; evita integração sem necessidade. |
| DEC-013 | CI usa GitHub Actions e recursos nativos de segurança; ações referenciadas por SHA e atualizadas pelo Dependabot. | Direção aprovada | Feedback rápido, pouca configuração e execução gratuita em runner padrão enquanto o repo é público. |
| DEC-014 | Saldos cripto entram como snapshots somente leitura e não como caixa para pagamento. | Aprovada na direção da V1 | Valor de mercado e liquidez têm significados diferentes. |
| DEC-015 | SonarQube Cloud pode complementar a qualidade do código depois de confirmar vínculo com Finance AI, elegibilidade OSS e quality gate útil. | Proposta / pendente de configuração no repositório | O app aparece na conta do titular, mas as capturas não mostram escopo de repositório e não há execução do Sonar no HEAD auditado. |
| DEC-016 | GitHub Actions é o único provedor obrigatório de CI; CircleCI e Cirrus CI ficam como alternativas, não paralelos. | Proposta do FAI-PLAN-001 / revisão pendente | Runners padrão do GitHub são gratuitos em repositório público; executar múltiplos CI acrescentaria tempo e manutenção sem evidência de ganho. |
| DEC-017 | Manter Dependabot no lugar de Renovate; avaliar Codecov/Chromatic/StepSecurity apenas quando o respectivo uso existir. | Proposta do FAI-PLAN-001 / revisão pendente | Evita duplicidade e gates prematuros; cobertura, UI/Storybook e hardening adicional dependem do scaffold. |

## Histórico

- 2026-10-22 — Titular aprovou espaços Pessoal/Loja, entrada manual/CSV, prioridades explicáveis, IA explicativa e nenhum pagamento automático.
- 2026-10-22 — Titular selecionou Supabase, pediu suporte a login com carteira/cripto via provedor como Privy, Cloudinary se imagens forem necessárias e CI GitHub gratuito.
- 2026-10-22 — Titular forneceu capturas do inventário de apps instalados; a auditoria visual e os limites de evidência foram registrados em [github-app-audit.md](../github-app-audit.md).
- Nenhum deploy ou projeto Supabase de Finance AI foi criado nesta etapa.
