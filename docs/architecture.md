# Architecture

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## Modelo lógico

1. Interface web responsiva, com áreas Pessoal, Loja, Visão consolidada, Contas, Compromissos, Dívidas e Plano.
2. API autenticada, responsável por autorização, validação, trilha de auditoria e chamadas ao domínio.
3. Módulos de domínio independentes: espaços e contas; livro de lançamentos; contas a pagar/receber; dívidas; projeção; prioridade/cenários; importação/exportação.
4. Persistência relacional transacional, escolhida no ADR técnico antes de codificar.
5. Adaptador de IA separado, com permissões somente de leitura para consultas e permissão para criar rascunhos. Nenhum endpoint de pagamento será exposto.
6. Importador CSV separado, com validação, prévia e chave de idempotência antes de gravar.

## Fluxo de uma recomendação

1. O usuário solicita uma análise.
2. A API verifica identidade e espaço selecionado.
3. Serviços determinísticos calculam caixa disponível, datas, custos conhecidos e opções.
4. O adaptador envia à IA apenas o contexto mínimo necessário e os resultados estruturados.
5. A interface mostra justificativa, fontes, premissas, riscos e dados ausentes.
6. O usuário pode ajustar um cenário ou confirmar um rascunho. A decisão de pagamento permanece fora do sistema.

## Regras arquiteturais

- Valores monetários são inteiros em centavos ou decimal exato; taxas preservam período e unidade.
- As regras financeiras ficam em serviços testáveis sem LLM.
- Entrada estimada não é tratada como dinheiro disponível confirmado.
- Transferência entre espaços é composta por lançamentos ligados e não pode inflar o consolidado.
- Pagamento de conta vincula a obrigação ao lançamento efetivamente confirmado, sem contagem dupla.
- Cada módulo possui uma interface e diretório próprios. Contratos compartilhados são definidos antes de PRs paralelas.
- Erros de leitura/importação não mudam silenciosamente dados confirmados.
- Dados de um espaço são filtrados e autorizados em todo acesso no servidor, não apenas na interface.

## Decisões técnicas ainda bloqueadoras

Stack, hospedagem, banco, identidade, criptografia gerenciada e provedor LLM não foram aprovados. O Work Order FAI-WO-M00-001 deve comparar opções por privacidade, custo total, uso em celular, exportação/backup, simplicidade e segurança, registrar um ADR e obter revisão antes da primeira implementação.

## Limites de integração

Na V1, fontes são entrada manual e arquivos CSV do usuário. Open Finance e iniciação de pagamento permanecem fora do sistema de produção até avaliação específica do parceiro, consentimento, segurança, custo e obrigações regulatórias.
