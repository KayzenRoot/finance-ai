# FAI-PLAN-001 — Design e planejamento inicial

Status: proposta detalhada registrada para rastreio; baseada na direção aprovada em conversa em 2026-10-22. Revisão do titular pendente.

## OBJECTIVE

Definir a V1 do Finance AI, estabelecer o Source Pack canônico, organizar módulos/issues e preparar execução por PRs pequenas, com critérios verificáveis e caminhos de paralelismo seguros.

## CONTEXT

O repositório estava vazio. O produto organiza finanças pessoais e da loja, contas, receitas, despesas, dívidas e prioridades em cenários de caixa apertado e renda variável. A V1 foi aprovada conceitualmente como experiência para um único titular, dois espaços financeiros, entrada manual/CSV, recomendações explicáveis e nenhuma execução de pagamento.

## SCOPE

- Source Pack em português para visão, requisitos, escopo, arquitetura, modelo de domínio, segurança, testes, deployment, backlog, DoD, decisões, Open Finance e checkpoint.
- Issues modulares FAI-M00 a FAI-M10 com Work Orders estáveis e dependências.
- Recomendação para priorizar ondas de execução e paralelismo após contratos compartilhados.
- Stack, hosting, autenticação, banco e provedor LLM permanecem gate de M00 antes da implementação.

## OUT OF SCOPE

- Código, UI implementada, deploy ou qualquer dado financeiro real.
- Open Finance em produção, pagamento automático, usuários de equipe, contabilidade/fiscal, investimentos ou negociação automática.
- Merge da PR de planejamento.

## FILES/SOURCES TO READ

README.md; docs/project-overview.md; docs/requirements.md; docs/scope.md; docs/architecture.md; docs/data-model.md; docs/security.md; docs/test-plan.md; docs/deployment.md; docs/backlog.md; docs/definition-of-done.md; docs/decisions/DECISIONS.md; docs/open-finance.md; docs/checkpoint.md; issues FAI-M00 a FAI-M10.

## REQUIREMENTS

Atender REQ-FIN-001 a REQ-FIN-012, REQ-SEC-001 a REQ-SEC-005, REQ-REL-001/002 e REQ-UX-001 na versão de planejamento. Nenhuma documentação pode afirmar que código, segurança, integração ou implantação já existem.

## ARCHITECTURE RULES

- Um titular; espaços Pessoal e Loja separados.
- Raciocínio numérico fora do LLM.
- Dinheiro em centavos/decimal exato.
- Entradas incertas ficam separadas do caixa confirmado.
- IA somente consulta dados permitidos e propõe rascunhos; alteração exige confirmação; pagamento não existe na V1.
- Dados reais proibidos no repositório público.
- Decisões técnicas bloqueadoras precisam de ADR antes de código.

## CONSTRAINTS

- Nenhum desenvolvimento de produto nesta Work Order.
- Nenhum merge ou deploy.
- Não afirmar provider, stack, preço ou elegibilidade Open Finance sem evidência atual.
- Issues precisam manter ID estável e critérios de aceite reproduzíveis.
- Abrir PR de planejamento para revisão.

## ACCEPTANCE CRITERIA

1. Todos os documentos mínimos do Source Pack existem e são mutuamente consistentes.
2. Escopo V1 e itens adiados estão identificados por necessidade/importância/futuro.
3. Módulos têm dependências, entregáveis, testes e critérios verificáveis.
4. O plano identifica pontos paralelizáveis e bloqueia trabalho quando contratos não estão estabilizados.
5. Open Finance está explicado com fontes oficiais e não é tratado como API livre.
6. Checkpoint declara o estado real: sem código, sem deploy e sem merge.
7. A PR inclui hashes base/head, documentos e riscos de decisão pendentes.

## TESTS

- Verificação de todos os links de documentos relativos.
- Verificação de consistência entre requisitos, escopo, módulos, DoD e decisões.
- Busca de placeholders, contradições e afirmações sem evidência.
- Revisão dos corpos de issues contra template de Work Order.
- Nenhum teste de produto aplicável: não existe código.

## DELIVERABLES

- Source Pack versionado.
- 11 issues de módulo com IDs FAI-M00 a FAI-M10.
- PR draft de planejamento sem merge.
- Checkpoint Delta proposto e inventário de decisões pendentes.

## REVIEW FORMAT

Auditar contra escopo, requisitos, arquitetura, critérios de aceite e DoD. Apontar findings por severidade, arquivo/seção, impacto, correção e evidência. Verificar SHA base/head e que nenhum código ou dado real foi incluído.

## STOP CONDITION

Parar após Source Pack e issues estarem na PR, revisão interna concluída e evidências registradas. Não iniciar código, deploy ou merge nesta Work Order.
