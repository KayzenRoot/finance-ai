# Project Overview

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## Propósito

Ajudar o titular a compreender e organizar o caixa pessoal e o da loja em espaços separados, registrar compromissos financeiros, projetar insuficiências futuras e comparar opções de pagamento com explicações claras.

## Problema

O produto atende pessoas que precisam acompanhar contas, vencimentos e renda variável, inclusive quando os compromissos projetados superam os recursos disponíveis. Deve reduzir esquecimentos e tornar explícito o que é conhecido, estimado ou ainda precisa ser informado. Não deve prometer que eliminará uma insuficiência quando os recursos forem menores que os compromissos.

## Usuário e cenário da V1

- Um único titular acessa a aplicação.
- Há dois livros independentes: Pessoal e Loja.
- A aplicação deve ser responsiva para navegador em celular e computador; validar esta decisão no planejamento técnico.
- Idioma e moeda iniciais propostos: português brasileiro e BRL.
- Aplicação privada com acesso autenticado; a escolha concreta de hospedagem e provedor de identidade é bloqueadora antes da implementação.

## Resultado esperado

1. O titular enxerga saldos e compromissos por espaço e, quando útil, um consolidado sem duplicar transferências.
2. As contas a pagar, a receber, dívidas e lançamentos têm datas, status e origem rastreáveis.
3. A previsão mostra saldo projetado e datas de insuficiência, distinguindo entradas confirmadas de estimadas.
4. O plano de prioridade explica seus critérios, dados ausentes e cenários comparados.
5. A IA responde a partir de dados estruturados e não movimenta dinheiro.

## Princípios de produto

- Clareza antes de automação.
- Um cálculo financeiro precisa ser reproduzível sem LLM.
- Cada sugestão mostra dados usados, premissas, incerteza e impacto estimado.
- O usuário decide e confirma alterações.
- Pessoal e loja ficam separados por padrão.
- Nunca capturar credenciais bancárias por scraping.
- Open Finance é uma opção futura sujeita a avaliação de parceiro e requisitos regulatórios.

## Não objetivos da V1

Não é sistema contábil/fiscal, ERP completo, consultor de investimentos, credor, negociador automático ou iniciador de pagamentos.
