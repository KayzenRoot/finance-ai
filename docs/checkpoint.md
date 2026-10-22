# Checkpoint

Status: Source Pack, issues atualizadas e workflows iniciais propostos na PR FAI-PLAN-001; aguardando revisão. Não é checkpoint APPROVED.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de trabalho: planning/FAI-PLAN-001-source-pack.
- Código de produto: ainda inexistente.
- Banco de Finance AI: nenhum projeto selecionado ou criado.
- CI de aplicação: scaffold ainda não existe; workflow executará checks quando package.json e lockfile forem adicionados.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), ainda draft.
- Issues FAI-M00 a FAI-M11: #2–#13.
- Pipeline planejado/arquivado em docs/ci.md e .github/workflows/.
- O primeiro CI identificou duas condições de qualidade: corrigir estilo de tabela Markdown e verificar se Dependency Graph está habilitado antes de ativar Dependency Review para manifests.
- Nenhum merge ou deploy realizado.

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- Privy solicitado para login com carteira; validação de compatibilidade e segurança no M00/M11.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.

## Próximo gate

Aguardar a nova execução do CI e revisar o Source Pack/issues. Depois, fechar ADRs e autenticação em M00 e executar módulos conforme dependências. Revisar limites Supabase Free e estratégia de backup independente antes de dados reais. Atualizar a evidência SHA após a verificação da PR.
