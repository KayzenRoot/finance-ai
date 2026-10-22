# Checkpoint

Status: Source Pack, issues atualizadas e workflows iniciais propostos na PR FAI-PLAN-001; aguardando revisão. Não é checkpoint APPROVED.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de trabalho: planning/FAI-PLAN-001-source-pack.
- Código de produto: ainda inexistente.
- Banco de Finance AI: nenhum projeto selecionado ou criado.
- CI de aplicação: scaffold ainda não existe; o workflow ativará testes Node quando package.json e lockfile forem adicionados.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), ainda draft.
- Issues FAI-M00 a FAI-M11: #2–#13.
- Workflow CI: run #2 passou; ID 39773397272.
- CodeQL Actions: run #2 passou; ID 39773397275.
- Check de aplicação passou como scaffold pendente; não havia package.json para lint/test/build do produto.
- Dependency Review não foi executado na segunda rodada porque não há manifesto/lockfile. A primeira tentativa exigiu confirmar a configuração Dependency Graph; habilitar/verificar no M00 antes do scaffold.
- Nenhum merge ou deploy realizado.

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- Privy solicitado para login com carteira; validar compatibilidade e segurança no M00/M11.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.
- SonarQube Cloud depende da auditoria autenticada de apps Marketplace e da vinculação ao repositório.

## Próximo gate

Revisar o Source Pack e issues. Fechar ADRs e autenticação em M00, habilitar Dependency Graph e conferir secret scanning/branch checks nas configurações. Executar módulos conforme dependências. Revisar limites Supabase Free e estratégia de backup independente antes de dados reais.