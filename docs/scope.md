# Escopo

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## V1 — incluído

1. Acesso privado para um titular.
2. Espaços Pessoal e Loja, separados, com transferências rastreáveis.
3. Contas bancárias, dinheiro em caixa, cartões e saldos informados.
4. Lançamentos de entradas, saídas e transferências.
5. Contas a pagar, contas a receber, recorrências e catálogo de dívidas.
6. Previsão de caixa de curto prazo com confiança explícita.
7. Motor determinístico de prioridades e comparação de cenários.
8. Painel e central de ações.
9. Assistente explicativo e rascunhos confirmáveis.
10. Importação CSV com prévia/deduplicação e exportação.
11. Banco Supabase Postgres com migrações e Row Level Security.
12. Login com carteira e criptoativos somente leitura via Privy ou provedor compatível, condicionado à validação de identidade/RLS do FAI-M00.
13. Segurança, trilha de auditoria, exportação, backup/recuperação e validação de release.
14. CI rápido em PRs com qualidade, testes da aplicação quando criada, Dependency Review e CodeQL.

## Fora da V1

- Open Finance em produção, agregadores bancários e iniciação de pagamentos.
- Pagamento, transferência, assinatura de transação, negociação ou contratação de crédito pelo sistema.
- Vários usuários, equipe da loja, permissões e colaboração.
- Contabilidade, emissão fiscal, folha, conciliação com ERP, estoque ou PDV.
- Recomendações de investimento, compra/venda ou staking.
- OCR, imagens/anexos de comprovantes, categorização automática sem confirmação e automações que assumam compromissos financeiros.
- Dados reais em GitHub, CI ou demonstração pública.

## Fases

- NECESSARY — funcionalidades incluídas na V1.
- IMPORTANT — notificações externas e categorização assistida após validar a base.
- FUTURE — Open Finance, usuários adicionais e pagamentos iniciados pela aplicação, cada um com decisão e revisão próprias.
- Cloudinary — condicional a uma funcionalidade de imagem aprovada; não adicionar ao V1 sem necessidade.

## Condições de entrada

- Revisar Source Pack e decisões.
- Fechar ADRs de framework, autenticação, IA e custos no FAI-M00.
- Provar o caminho Privy/Supabase e testes de RLS antes de dados financeiros.
- Aprovar contratos compartilhados e Work Orders aplicáveis.
- Manter política de dados sintéticos e plano de backup independente.
