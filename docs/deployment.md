# Deployment and Operations

Status: proposta de planejamento em revisão. Nenhuma aplicação está implantada.

## Decisão de plataforma

Hospedagem, banco, autenticação, região de dados, provedor LLM e custos permanecem decisões bloqueadoras. FAI-WO-M00-001 deve registrar alternativas, custo estimado, política de backup/exportação, acesso por celular, segurança e plano de saída em ADR antes de escrever código de produção.

## Gate de implantação

- Ambiente privado com HTTPS e autenticação.
- Segredos ausentes do repositório e do bundle do navegador.
- Migrações versionadas e testadas em ambiente isolado.
- Logs sem dados financeiros detalhados.
- Backup automático, retenção definida e restauração ensaiada.
- Exportação e exclusão de dados verificadas.
- Monitoramento de erros e limites de custo para LLM.
- Dados sintéticos para staging; nenhuma demonstração pública com dados do titular.
- Plano de rollback para aplicação e roll-forward para migrações.
- Teste de release em celular e computador.
- Titular verifica saldos e lançamentos importados antes de usar recomendações.

## Operação V1

Não haverá pagamento iniciado pela aplicação, sincronização bancária automática ou automação de decisões financeiras. A conexão futura com Open Finance exige um gate próprio de viabilidade, consentimento, parceiro/participação, segurança, custo e suporte.
