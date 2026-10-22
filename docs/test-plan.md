# Test and Benchmark Plan

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001. Risco: ELEVATED.

## Testes requeridos por incremento

- Unitários para dinheiro, datas, taxas, recorrência, projeções e critérios do motor de prioridade.
- Integração para persistência, autorização, transferências, liquidação de obrigação e idempotência de importação.
- Testes de contrato para API e adaptador da IA.
- Testes de interface para celular e computador, acessibilidade básica e estados vazios/erro.
- Regressão ampla antes de release.
- Segurança: lint/SAST, dependências, segredos, controle de acesso e testes de isolamento entre espaços.
- Backup e restauração comprovados com dados sintéticos antes de dados reais.

## Casos financeiros críticos

1. Soma, subtração e arredondamento em centavos sem erro de ponto flutuante.
2. Transferência interna aparece em cada livro, mas seu efeito líquido é zero no consolidado.
3. Obrigações pagas não aparecem novamente como saída prevista.
4. Recebível incerto não é tratado como saldo garantido.
5. Importação repetida do mesmo extrato não duplica operações sem aviso.
6. Falta de taxa, CET, mínimo ou vencimento reduz confiança e impede falsa precisão.
7. Caixa insuficiente deve mostrar data e valor do déficit, não produzir plano impossível.
8. Entrada em um espaço não altera a previsão do outro, exceto transferência explicitamente vinculada.
9. Isolamento de acesso funciona no servidor, mesmo manipulando IDs no cliente.
10. Resposta da IA reflete resultados da API; matemática divergente reprova o teste.

## Saída de evidência

Cada PR inclui SHA base/head, arquivos, decisões relacionadas, testes executados e resultados, riscos restantes, erros corrigidos e proposta de atualização do checkpoint. Testes com dados pessoais reais são proibidos no CI.
