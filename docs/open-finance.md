# Open Finance — avaliação de viabilidade

Estado: fora da V1; avaliar após validar o controle manual e importação CSV. Consulta de fontes oficiais em 2026-10-22.

## Como funciona para o cliente

O cliente escolhe a instituição que receberá dados e autoriza o compartilhamento no fluxo de consentimento/autenticação/confirmação. O consentimento pode ser cancelado. As APIs permitem compartilhamento de dados como cadastro, contas, saldos, extratos, cartões e crédito conforme escopo autorizado. A infraestrutura conecta instituições participantes diretamente; não é um banco central de dados aberto a qualquer aplicativo.

## O que significa para Finance AI

A autorização do usuário é necessária, mas não transforma automaticamente qualquer aplicação em participante apto a consultar APIs bancárias. Para integrar, o projeto terá de avaliar elegibilidade/participação própria ou parceiro/provedor que ofereça o acesso apropriado, contratos, instituições atendidas, dados disponíveis, fluxo de consentimento, revogação, segurança, retenção, suporte, custo e obrigações legais. A viabilidade concreta depende do modelo de negócio e do provedor escolhido.

## Fases recomendadas

1. V1: entrada manual e CSV; sem credenciais bancárias armazenadas e sem scraping de internet banking.
2. Descoberta posterior: comparar provedores/parceiros com documentação atual, cobertura, preço, política de dados, consentimentos, revogação, segurança e tratamento de falhas.
3. Se aprovado: integração inicialmente somente de leitura, com estado do consentimento, origem e horário de sincronização, reconciliação e desconexão/exclusão.
4. Iniciação de pagamentos é escopo diferente, bloqueado para versão futura e exige análise própria de participação, segurança e confirmação explícita.

## Fontes oficiais

- [Banco Central — Open Finance](https://www.bcb.gov.br/estabilidadefinanceira/openfinance)
- [Banco Central — participantes do Open Finance](https://www.bcb.gov.br/estabilidadefinanceira/openfinance_participantes)
- [Open Finance Brasil — participantes e regras](https://openfinancebrasil.org.br/)
- [Banco Central — cancelar autorização de compartilhamento](https://www.bcb.gov.br/meubc/faqs/p/como-cancelar-uma-autorizacao-no-open-finance)
- [Banco Central — Relatório de Cidadania Financeira 2025, seção Open Finance](https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/RCF/relatorio_de_cidadania_financeira_2025.pdf)
