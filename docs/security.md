# Security and Privacy

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001. Classificação de risco do produto: ELEVATED, pois armazena informação financeira sensível e oferece apoio à decisão; pagamentos automáticos estão excluídos.

## Dados protegidos

Saldos, transações, credores, dívidas, renda e rotina financeira são dados de alta sensibilidade. O repositório público contém somente código, documentação e dados sintéticos.

## Controles obrigatórios antes de produção

- Autenticação forte e sessão segura; detalhes definidos antes da implementação.
- Autorização em cada operação no servidor por titular e espaço.
- Criptografia em trânsito e em repouso fornecida por infraestrutura revisada.
- Segredos apenas em cofre de segredos/variáveis protegidas; nunca no Git.
- Privilégio mínimo para banco, provedores e IA.
- Exportação e exclusão de dados testadas.
- Registro de auditoria sem valores completos, credenciais ou descrições sensíveis.
- Backup protegido e teste de restauração antes de armazenar dados reais.
- Revisão de dependências, análise estática, varredura de segredos e threat model antes de liberar.
- Retenção mínima de arquivos de extrato; exclusão rastreável após importação quando aplicável.
- Separação e verificação de acesso entre Pessoal e Loja.

## IA e conteúdo não confiável

- Nunca enviar credenciais bancárias, tokens de sessão ou dados além do mínimo necessário ao provedor LLM.
- Usuário não entrega credenciais de banco para a IA.
- Descrições de lançamentos e arquivos importados são conteúdo não confiável; não podem alterar permissões ou instruções de sistema.
- IA não calcula juros, ranking ou saldo final. Usa funções determinísticas com saída tipada.
- A IA pode consultar dados autorizados e preparar rascunhos. Toda gravação exige revisão e confirmação.
- Não há ferramenta ou segredo que permita iniciar pagamentos, transferências ou contratação de crédito.
- Política de retenção, região de processamento e uso de dados do provedor LLM devem ser avaliadas no ADR.

## Incidentes e resposta

Antes de produção, definir canal de notificação, revogação de credenciais, restauração, exclusão de dados e comunicação de incidente. Qualquer vazamento de dados reais exige interromper a publicação, preservar evidências, revogar segredos afetados e tratar o incidente antes de seguir.
