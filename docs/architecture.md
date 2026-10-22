# Arquitetura

Status: FAI-M00 fecha Next.js 16, TypeScript, Node.js 24, npm e Supabase Auth Web3 nativo. O escopo financeiro continua fora desta fundação.

## Componentes

1. Interface web responsiva para Pessoal, Loja, consolidado, contas, compromissos, dívidas e plano de ação.
2. API autenticada no servidor para autorização, validação, auditoria e acesso ao domínio.
3. Domínio determinístico para saldos, lançamentos, projeções, custos de atraso e cenários de pagamento.
4. Supabase Postgres como sistema de registro escolhido; migrações versionadas e RLS em toda tabela exposta.
5. Supabase Auth Web3 para SIWE (Ethereum/EVM) e SIWS (Solana); um gate de titular no servidor e RLS autorizam os dados.
6. Adaptador cripto de somente leitura para endereços autorizados, snapshots de saldos e fonte/horário de preço.
7. Adaptador LLM isolado; recebe apenas contexto mínimo e resultados estruturados do domínio.
8. CI em GitHub Actions; o deploy permanece fora do escopo até uma decisão posterior.

## Direção de stack

A fundação usa Next.js 16, TypeScript, Node.js 24 e npm, com `@supabase/ssr` e Supabase Auth. O Proxy do Next atualiza sessões via `getClaims()`; páginas do servidor validam claims e a allowlist do titular. A aplicação pode rodar sem configuração de backend para facilitar o scaffold, mas não libera acesso financeiro.

## Identidade, carteira e dados

- Supabase é o banco selecionado.
- Supabase Auth Web3 nativo é o caminho escolhido para a primeira versão: suporta SIWE para Ethereum e SIWS para Solana e entrega a sessão diretamente ao Supabase. O teste de carteira sintética valida a identidade retornada e o RLS por usuário. Privy fica como alternativa futura se surgir requisito que o fluxo nativo não atenda.
- Uma assinatura de autenticação comprova posse da carteira naquele desafio; ela não autoriza transação, troca, pagamento ou movimentação de fundos.
- `FINANCE_AI_OWNER_USER_ID` limita a aplicação a uma identidade explicitamente autorizada. Configure a variável somente no servidor depois de validar o identificador do titular em ambiente privado.
- Endereço público de carteira vinculado ao titular é dado sensível no contexto do produto.
- O sistema nunca recebe seed phrase ou chave privada e não cria uma autorização para transferir cripto.
- Saldos cripto são snapshots com rede, ativo, quantidade, valor de referência, fonte e horário.
- Valor de mercado cripto não entra no caixa disponível para pagar contas; a tela distingue patrimônio de liquidez.
- Cloudinary não é necessário no escopo atual, que usa CSV e não exige imagem. Só avaliar Cloudinary quando existir uma funcionalidade de imagem aprovada.
- Open Finance e iniciação de pagamento continuam fora da V1.

## Fluxo de recomendação

1. O titular escolhe o espaço financeiro e pergunta sobre a situação.
2. A API valida sessão, titular e espaço com políticas do banco.
3. Serviços determinísticos calculam caixa confirmado, compromissos, custos conhecidos e cenários.
4. A IA recebe os resultados e dados mínimos necessários para explicar opções e incertezas.
5. A interface mostra critérios, premissas, fontes, data de atualização e limitações.
6. O titular pode editar ou confirmar um rascunho. A aplicação nunca inicia pagamento.

## Regras de domínio

- Dinheiro usa centavos inteiros ou decimal exato; taxas preservam unidade e período.
- Recebíveis incertos não são caixa confirmado.
- Transferências internas são ligadas e neutralizadas no consolidado.
- Obrigação liquidada liga-se ao lançamento correspondente para não contar duas vezes.
- Snapshot antigo de saldo/preço aparece como desatualizado.
- Regras financeiras são testáveis sem LLM e sem rede.
- Descrição de extrato e arquivos importados são conteúdo não confiável.
- Nenhum acesso a dados é protegido somente por filtros da interface.
