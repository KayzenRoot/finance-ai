# Registro de decisões

Estado: decisões conceituais 001–004 e stack/autenticação/Supabase aprovadas para implementação no FAI-M00; hospedagem e LLM permanecem pendentes.

| ID | Decisão | Estado | Motivo / consequência |
|---|---|---|---|
| DEC-001 | V1 para um único titular; multiusuário fora. | Aprovada | Mantém o primeiro corte pequeno e privado. |
| DEC-002 | Pessoal e Loja são espaços separados; transferência interna vinculada e neutralizada no consolidado. | Aprovada | Evita mistura e dupla contagem. |
| DEC-003 | Começar com entrada manual e CSV; Open Finance fora da V1. | Aprovada | Permite começar sem depender de parceiro e elegibilidade. |
| DEC-004 | IA explica e prepara rascunhos; cálculo é determinístico; não há pagamento automático. | Aprovada | Mantém controle do titular e resultados reproduzíveis. |
| DEC-005 | Locale inicial pt-BR/BRL. | Proposta | Adequado ao uso informado; validar na implementação. |
| DEC-006 | Next.js 16, TypeScript, Node.js 24 e npm para a aplicação web. | Aprovada no FAI-M00 | Stack com suporte a sessões Supabase SSR, workflows rápidos e lockfile reproduzível. LLM e hospedagem continuam pendentes de módulos/ADR próprios. |
| DEC-007 | Aplicação web responsiva. | Proposta | Atende telefone e computador. |
| DEC-008 | Repositório público não recebe dados reais, segredos, endereços de carteira do titular ou fixtures identificáveis. | Regra aprovada | Protege dados sensíveis. |
| DEC-009 | Risco do produto ELEVATED por dados financeiros e apoio à decisão. | Proposta | Exige testes de segurança e recuperação. |
| DEC-010 | Supabase Postgres será o banco de dados da aplicação. | Aprovada pelo titular em 2026-10-22 | Migrações versionadas, exposição explícita à Data API e RLS são requisitos. O Free pode pausar após uma semana inativo e não inclui backup automático diário nem PITR; restaurar dados depende de exportação independente. |
| DEC-011 | Supabase Auth Web3 nativo para login SIWE (Ethereum/EVM) e SIWS (Solana); Privy fica adiado. | Aprovada no FAI-M00, sujeita a validação CI | A sessão e autorização permanecem no Supabase. A assinatura só autentica; RLS e allowlist do servidor restringem o titular. Usar Privy apenas se houver requisito não atendido pelo fluxo nativo. |
| DEC-012 | Cloudinary fica condicionado a uma funcionalidade real de imagem. | Aprovada como condição | V1 atual não usa anexos/imagens; evita integração sem necessidade. |
| DEC-013 | CI usa GitHub Actions e recursos nativos de segurança; ações referenciadas por SHA e atualizadas pelo Dependabot. | Aprovada | Checks rápidos de app em toda PR e workflow Supabase condicionado a migrações, testes ou lockfile; runner padrão enquanto o repo é público. |
| DEC-014 | Saldos cripto entram como snapshots somente leitura e não como caixa para pagamento. | Aprovada na direção da V1 | Valor de mercado e liquidez têm significados diferentes. |
| DEC-015 | SonarQube Cloud pode complementar a qualidade do código depois de confirmar vínculo com Finance AI, elegibilidade OSS e quality gate útil. | Proposta / pendente de configuração no repositório | O app aparece na conta do titular, mas as capturas não mostram escopo de repositório e não há execução do Sonar no HEAD auditado. |
| DEC-016 | GitHub Actions é o único provedor obrigatório de CI; CircleCI e Cirrus CI ficam como alternativas, não paralelos. | Proposta do FAI-PLAN-001 / revisão pendente | Runners padrão do GitHub são gratuitos em repositório público; executar múltiplos CI acrescentaria tempo e manutenção sem evidência de ganho. |
| DEC-017 | Manter Dependabot no lugar de Renovate; avaliar Codecov/Chromatic/StepSecurity apenas quando o respectivo uso existir. | Proposta do FAI-PLAN-001 / revisão pendente | Evita duplicidade e gates prematuros; cobertura, UI/Storybook e hardening adicional dependem do scaffold. |

## Histórico

- 2026-10-22 — Titular aprovou espaços Pessoal/Loja, entrada manual/CSV, prioridades explicáveis, IA explicativa e nenhum pagamento automático.
- 2026-10-22 — Titular selecionou Supabase, pediu suporte a login com carteira/cripto via provedor como Privy, Cloudinary se imagens forem necessárias e CI GitHub gratuito.
- 2026-10-22 — FAI-M00 implementa Supabase Auth Web3 nativo em vez de adicionar Privy: SIWE/SIWS, allowlist no servidor, RLS por titular e teste com carteiras sintéticas; ainda depende de validação do workflow e revisão da PR.
- 2026-10-22 — Titular forneceu capturas do inventário de apps instalados; a auditoria visual e os limites de evidência foram registrados em [github-app-audit.md](../github-app-audit.md).
- Nenhum deploy ou projeto Supabase de Finance AI foi criado nesta etapa.
