# Definition of Done — V1

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

A V1 estará completa quando todos os itens abaixo estiverem comprovados:

## Produto

- Um titular consegue entrar em ambiente privado e operar nos espaços Pessoal e Loja.
- Contas, lançamentos, obrigações, recebíveis, dívidas, recorrências e transferências são persistidos e editáveis com trilha de origem.
- Saldo histórico, saldo atual e projeção não contam a mesma operação duas vezes.
- Importação CSV valida prévia, duplicidade e confirmação; exportação produz dados reutilizáveis.
- Painel mostra saldo por espaço, compromissos futuros, datas de insuficiência e entradas incertas separadas.
- Plano de prioridade compara cenários, explica critérios e não inventa dados ausentes.
- Assistente responde baseado em cálculos do domínio; propostas de alteração são rascunhos confirmados pelo titular.
- Nenhum fluxo de pagamento ou conexão Open Finance está habilitado na V1.

## Qualidade e segurança

- Testes unitários, integração, contrato, interface e regressão aplicáveis passam.
- Varredura de dependências, estática e segredos não apresenta vulnerabilidade HIGH/CRITICAL aberta.
- Isolamento de titular e espaços, exportação, exclusão, backup e restauração foram verificados.
- Threat model e plano de incidente revisados.
- Nenhum dado financeiro real ou segredo no Git, CI ou ambiente público.
- A interface foi validada em celular e computador com dados sintéticos.

## Release e governança

- Documentação canônica reflete comportamento verificado, sem declarar integração não implementada.
- Issues e PRs vinculadas possuem evidências, base/head SHA e checkpoint atualizado.
- Implantação privada revisada e validada pelo titular com dados de teste.
- Auditoria final contra requisitos, escopo, arquitetura, critérios de aceite e segurança conclui APPROVED.
- Nenhuma pendência HIGH/CRITICAL fica aberta.
