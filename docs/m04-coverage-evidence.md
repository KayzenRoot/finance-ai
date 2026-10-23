# FAI-WO-M04-001 · Cobertura M04 mensurável, sem dependências novas

## Escopo da instrumentação

- O pipeline `CI / Application checks` continua executando `test:ci`, TypeScript, lint e build. Um passo adicional usa **Node 24 nativo** com `--experimental-test-coverage` e reporter LCOV (`coverage/lcov.info`, pasta já ignorada pelo Git). O script `scripts/verify-m04-lcov.mjs` exige **counters reais e positivos** para o módulo `src/lib/finance/debt-input.mjs`, sem inventar taxa mínima ou porcentagem.
- A validação pura de valores em BRL, juros/CET, período e fonte foi extraída *sem mudar regras* da Server Action para `src/lib/finance/debt-input.mjs`. As Server Actions continuam realizando autenticação, leitura de usuário e chamada à RPC; as migrações SQL, views, RLS, SQLSTATE e oráculos pgTAP permanecem intocados. A extração torna a lógica de entrada diretamente testável com FormData e valores sintéticos.
- `tests/db/debt-input.test.mjs` acrescenta cenários positivos/negativos de centavos, limite, casas decimais, valores ausentes (NULL em vez de zero), juros mensais versus CET anual, fontes incompletas, períodos inválidos e valores não-textuais. Os demais testes continuam rodando.
- O LCOV gerado comprova execução **somente dos módulos .mjs importados nos testes**. Não é cobertura medida de `debt-actions.ts` como Server Action completa, de autenticação/Supabase/Next, de `page.tsx` React, de RPC SQL ou de navegador. As provas destes limites são mantidas nos testes pgTAP e no smoke sintético, mas sem equivalência artificial de porcentagens.

## Limite da integração SonarCloud

O SonarQube Cloud **não ingere LCOV em Automatic Analysis**. Sua documentação exige análise baseada em CI e `sonar.javascript.lcov.reportPaths`, scanner autorizado e relatório disponível antes da execução do scanner. Esta Correction Delta **não altera** configuração remota, token ou Quality Gate nem inicia análise CI duplicada. Portanto o indicador SonarCloud `0.0% Coverage on New Code` pode permanecer inalterado, mesmo havendo um LCOV válido no CI.

## Evidência e gates exigidos

- A geração LCOV deve ser verificada no job da PR, não apenas em ambiente de ensaio. `LH/LF` e `BRH/BRF` têm que vir do relatório bruto, com arquivo `SF:src/lib/finance/debt-input.mjs` e hashes do HEAD auditado.
- Após alteração da branch: confirmar CI, cinco required checks, 178/178 pgTAP, EVM/Data API/RLS/proveniência/revogação, restauro sintético, CodeQL, SonarCloud e Socket. Manter `CORRECTION REQUIRED` até decidir riscos remanescentes e ter cobertura TSX/Server Actions efetiva; não relatar essa lacuna como resolvida.
- **STOP:** sem merge, deploy, gastos, dados reais ou M05. Inventário histórico `docs/sonar-m04-issue-inventory.md` inalterado.

## Medição ampliada de arquivos TypeScript e TSX

- A suíte sintética executa os módulos originais `debt-actions.ts` e `page.tsx` via carregador restrito ao ambiente de teste com `typescript.transpileModule` e `inlineSourceMap`/`inlineSources`; o reporter nativo Node 24 deve atribuir as linhas executadas aos caminhos TS/TSX originais.
- `test:coverage` inclui explicitamente a rotina pura, a Server Action e a página TSX. `scripts/verify-m04-lcov.mjs` exige registros `SF` e contadores inteiros positivos `LF/LH` e `BRF/BRH` para **cada um dos três módulos**, e falha se a origem TSX não estiver representada. Os valores definitivos só podem ser citados após execução no GitHub CI do novo HEAD.
- O teste sintético adicional confere, na renderização Pessoal e Loja, filtros simultâneos de `owner_id` e `space_id`, ausência de exibição cruzada de dívidas de outros espaços e não consulta a ambientes reais. Isso valida os filtros de chamada presentes na UI, **não substitui RLS no banco nem comprova integração Next de produção**.
- Mesmo com cobertura numérica TS/TSX, ela descreve apenas as partes executadas por mocks, sem autenticação de rede, comportamento de navegador, hidratação ou captura do SonarCloud Automatic Analysis. Não declarar 100% da aplicação nem modificar tokens, modos de análise remotos ou Quality Gate.
