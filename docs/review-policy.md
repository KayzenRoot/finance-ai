# Finance AI — política padrão de revisão de PRs

**Escopo:** KayzenRoot/finance-ai, Work Orders M00–M11 e demais PRs. Esta regra foi solicitada pelo proprietário em 22/10/2026. **Revisor padrão fixo:** `kayzenweb3`.

## Fluxo automático

1. A implementação abre PR numa branch isolada, com issue/Work Order, evidência e HEAD atual explícitos.
2. O workflow [Default PR reviewer](../.github/workflows/default-pr-reviewer.yml) solicita a revisão para `kayzenweb3` nos eventos de abertura, reabertura, ready-for-review e novos commits. A solicitação **não** equivale a aprovação. Ele não executa código da PR e funciona mesmo com base pública; não usa tokens de produção.
3. Para receber solicitação de revisão, `kayzenweb3` deve constar como colaborador elegível da organização/repositório, com permissão `write` ou superior, ter aceitado o convite e não ser autor da PR. Se o GitHub não conceder permissão, registrar o bloqueio e não adicionar bypass.
4. Somente um review **APPROVED real**, para o HEAD relevante, satisfaz o required approval do ruleset. A auditoria técnica automatizada pode preparar achados ou emitir `COMMENT`/`REQUEST_CHANGES`, mas não pode fingir assinatura de terceiro. A revisão deve verificar evidências concretas e poder rejeitar mudanças.
5. Após novos commits, o ruleset invalida aprovações antigas. Revalidar checks, autor da aprovação, status de threads e `mergeable_state`.
6. Não exigir que o proprietário repita a escolha de revisor nas próximas PRs. Não solicitar autorização manual de execução de testes e reviews; jamais fazer merge sem os gates e demais autorizações previstas no Work Order.

## Falha fechada

A PR permanece **BLOCKED** se `kayzenweb3` não tiver permissão, se a conta não estiver conectada para eventual ação autorizada, se não houver aprovação independente válida ou se checks falharem. O workflow solicita review, **não publica `APPROVE`**. Controle administrativo, autor e identidade efetiva devem estar visíveis no GitHub. O GitHub não aceita que o autor da PR aprove sua própria PR.

## Situação inicial verificada — PR #16

- PR autora: `KayzenRoot`, HEAD anterior à adoção: `5628742bdd8e6fab0e3cec19a18a8d1727b79a26`.
- Em 22/10/2026 a API informou permissão `read` para `kayzenweb3`. A solicitação direta de reviewer na PR #16 retornou HTTP **422**: o GitHub não reconhece esse usuário como colaborador com capacidade de review.
- Conexões GitHub expostas ao agente atualmente: `KayzenRoot`, `csn1985`, `goodz-labs`; nenhuma identidade conectada `kayzenweb3`.
- O workflow só estará ativo para novas PRs depois que ele for incorporado à `main` pela própria PR #16, respeitando seus gates. A PR #16 exige requisição de review após promoção da permissão, por ferramenta ou interface.
- M00 não está aprovado enquanto faltar review elegível, mesmo com CI verde. Nunca afirmar que um review da IA em outra identidade corresponde a uma análise independente de terceiro sem evidência.
