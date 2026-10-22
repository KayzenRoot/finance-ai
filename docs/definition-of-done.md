# Definition of Done — V1

Status: proposta atualizada em revisão — Work Order FAI-PLAN-001.

A V1 estará completa quando os itens abaixo estiverem comprovados:

## Produto

- Um titular entra no ambiente privado e opera nos espaços Pessoal e Loja.
- Contas, lançamentos, obrigações, recebíveis, dívidas, recorrências e transferências têm origem e estados corretos.
- Saldos confirmados, históricos e projeções não contam a mesma operação duas vezes.
- Importação CSV valida prévia e duplicidades; exportação gera dados reutilizáveis.
- Painel informa caixa, compromissos, insuficiências e entradas incertas.
- Plano compara cenários e explica critérios, limites e dados ausentes.
- Assistente usa resultados do domínio; alterações ficam em rascunho até confirmação.
- Login com carteira funciona pelo provedor escolhido ou a alternativa aprovada no ADR.
- Criptoativos aparecem com rede, ativo, preço/fonte/horário e estado de atualização, sempre separados de caixa disponível.
- Não há Open Finance, transações assinadas, pagamento ou movimentação automática.

## Qualidade e segurança

- CI passa: documentação, lint, typecheck, testes, build, dependency review e CodeQL conforme arquivos alterados.
- Segredos/credenciais e dados reais não aparecem no Git, CI, fixtures ou logs.
- Nenhuma vulnerabilidade HIGH/CRITICAL bloqueadora fica sem tratamento aprovado.
- RLS e isolamento do titular, exportação, exclusão, backup/restauração e IDOR são verificados.
- Integração cripto é somente leitura; nenhuma seed phrase ou chave privada é solicitada ou guardada.
- Threat model e plano de incidente estão revisados.
- UI foi validada em celular/computador com dados sintéticos.

## Release e governança

- Documentação descreve somente comportamento implementado e verificado.
- Issues/PRs possuem evidências, base/head SHA e checkpoint atualizado.
- Deploy privado e monitoramento são revisados pelo titular com dados de teste.
- Gate final contra requisitos, escopo, arquitetura, segurança e DoD conclui APPROVED.
