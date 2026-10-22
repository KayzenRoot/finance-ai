# Finance AI — política atual de entrega automatizada

**Decisão do titular em 22/10/2026:** priorizar a construção do sistema sem depender de revisão, aprovação ou resposta de terceiros. Esta política **substitui** a política histórica de reviewer fixo `kayzenweb3`.

## Fluxo de execução

1. Desenvolver cada Work Order diretamente na branch de implementação e registrar PR, SHA base/head, arquivos, testes, evidências e checkpoint.
2. Não solicitar reviewer nem exigir review humano, nem publicar aprovações em nome de terceiros. O ruleset deve exigir **zero aprovações**, mantendo PR obrigatória, cinco checks estáveis, squash/linear history, bloqueio de force-push e de exclusão, sem bypass.
3. Executar CI, CodeQL quando disparado, Dependency Review, Socket Security e testes Supabase/RLS apropriados, com evidência real do HEAD final. Falhas de teste ou política de segurança devem ser corrigidas antes de integrar.
4. Sempre consultar o ruleset real, os status checks e as condições do Work Order antes de integração. Integrar por squash merge **normal** quando os gates aplicáveis forem cumpridos, respeitando quaisquer restrições ou autorizações específicas ainda vigentes; nunca fazer bypass.
5. Registrar a conclusão do módulo e seguir ao próximo segundo as dependências do backlog. O desenvolvimento de código não requer dados financeiros reais, um projeto hospedado ou produção.
6. Implantação, gasto, credenciais e dados financeiros reais continuam ações separadas, condicionadas a autorização e provas de segurança/backup apropriadas.

## Limites de capacidade

O GitHub não oferece operações de administração do ruleset à conexão instalada. A mudança de `required_approving_review_count=1` para `0` deve ser feita pelo administrador no [ruleset](https://github.com/KayzenRoot/finance-ai/rules/25657724); a política escrita no repositório não altera a proteção do servidor. Nenhuma análise da IA deve ser apresentada como review independente ou aprovação humana.

## Histórico (substituído)

A regra anterior designava `kayzenweb3` como reviewer obrigatório. A conta foi conectada e recebeu `write`; a solicitação na PR #16 foi confirmada, porém o titular revogou esse requisito. Seu convite e sua permissão podem permanecer, mas não serão usados como condição de avanço. O fluxo antigo e o workflow que solicitava reviews foram descontinuados.
