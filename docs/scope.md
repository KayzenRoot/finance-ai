# Scope

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## V1 — incluído

1. Acesso privado de um titular.
2. Espaços Pessoal e Loja, com separação de dados e transferências rastreáveis.
3. Contas e saldos informados pelo usuário.
4. Lançamentos de entradas, saídas e transferências.
5. Contas a pagar, contas a receber, recorrências e catálogo de dívidas.
6. Previsão de caixa de curto prazo com classificação de confiança.
7. Motor determinístico para prioridades e comparação de cenários.
8. Painel de caixa e central de ações.
9. Assistente conversacional explicativo e rascunhos confirmáveis.
10. Importação CSV com prévia e controle de duplicidade; exportação.
11. Segurança, auditoria, backup, recuperação e validação de release.

## Fora da V1

- Open Finance em produção, agregadores bancários e iniciação de pagamentos.
- Pagamento, transferência ou contratação de crédito pelo sistema.
- Vários usuários, equipe da loja, permissões e colaboração.
- Contabilidade, emissão fiscal, folha, conciliação com ERP, estoque ou PDV.
- Recomendações de investimento e compra/venda de ativos.
- Negociação automática com credores ou alegações de aconselhamento profissional.
- OCR de comprovantes, categorização automática sem confirmação e automações que assumam compromissos financeiros.
- Publicação de dados reais ou ambientes de demonstração com dados identificáveis.

## Importância e fases

- NECESSARY — itens listados em V1.
- IMPORTANT — lembretes por notificações externas e maior automação de categorização; avaliar após V1.
- FUTURE — Open Finance, mais usuários e pagamento iniciado pela aplicação, cada um com decisão, segurança e elegibilidade próprias.
- OUT OF SCOPE — funções fiscais/ERP e investimento enquanto o produto for este assistente.

## Condições de entrada

Não iniciar implementação até:
- Source Pack revisado.
- Hospedagem, autenticação, banco e gestão de segredos escolhidos em ADR.
- Contratos de domínio e interfaces compartilhadas fechados.
- Work Orders de implementação aprovados.
- Plano de teste de risco elevado adotado.
