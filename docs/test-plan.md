# Plano de testes e CI

Status: proposta em revisão — Work Order FAI-PLAN-001. Risco ELEVATED.

## Verificações em cada PR

O workflow está documentado em [ci.md](ci.md) e .github/workflows/.

| Check | Quando | Objetivo |
|---|---|---|
| Markdown lint | Toda PR e push em main | Evitar documentação inconsistente |
| Aplicação Node | Toda PR; executa quando package.json existe | npm ci, lint, typecheck, testes e build |
| Dependency Review | PR | Bloquear vulnerabilidades novas HIGH/CRITICAL |
| CodeQL Actions | Alteração de workflow | Analisar os workflows do GitHub Actions |
| CodeQL JS/TS | Alteração de código JS/TS | Análise semântica de segurança |
| Dependabot | Semanal | Atualizar Actions e npm em grupos pequenos |
| Secret scanning | Configuração do repositório público | Detectar segredos vazados; verificar status nas configurações |

Checks independentes rodam em paralelo. Execução antiga da mesma PR é cancelada. Não há matriz de versões nem deploy em cada PR. SonarCloud entra somente depois de confirmar app instalado, integração, plano OSS e ausência de análise duplicada.

## Testes de produto por incremento

- Unitários para dinheiro, datas, taxas, recorrência, projeção e regras de prioridade.
- Integração para persistência, autorização, transferências, liquidação e idempotência de importação.
- Testes de RLS com dois titulares sintéticos e tentativas cruzadas de acesso.
- Contrato para API, autenticação Privy/Supabase e adaptador de IA.
- Interface em celular/computador, acessibilidade básica e estados vazios/erro.
- Testes do adaptador cripto com endereços sintéticos, balances antigos, provider indisponível e falha de preço.
- Testes negativos demonstram que não existe endpoint de assinatura/transação.
- Testes E2E amplos em mudança de fluxo crítico e release, não em cada check trivial.
- Backup/exportação e restauração comprovados com dados sintéticos.

## Casos financeiros críticos

1. Soma, subtração e arredondamento em centavos sem erro de ponto flutuante.
2. Transferência interna tem efeito líquido zero no consolidado.
3. Obrigação paga não reaparece como saída prevista.
4. Recebível incerto não é saldo garantido.
5. Importação repetida não duplica sem aviso.
6. Falta de taxa, CET, mínimo ou vencimento reduz confiança e evita falsa precisão.
7. Caixa insuficiente mostra data/valor do déficit.
8. Um espaço não altera previsão do outro, exceto por transferência vinculada.
9. Acesso entre titulares falha no banco, mesmo alterando IDs.
10. IA reflete a saída da API; matemática divergente reprova.
11. Cripto é separado de caixa, tem preço datado e marca saldo antigo como desatualizado.
12. Perda de provedor não apaga dados locais confirmados.

## Evidência

Cada PR inclui SHA base/head, arquivos, decisões, testes executados, resultados, riscos restantes e Checkpoint Delta. Testes com dados financeiros ou carteiras reais são proibidos no CI.
