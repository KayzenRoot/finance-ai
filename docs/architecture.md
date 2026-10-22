# Arquitetura

Status: proposta atualizada pela direção do titular em 2026-10-22; decisões de stack e identidade serão fechadas no FAI-M00 antes da aplicação.

## Componentes

1. Interface web responsiva para Pessoal, Loja, consolidado, contas, compromissos, dívidas e plano de ação.
2. API autenticada no servidor para autorização, validação, auditoria e acesso ao domínio.
3. Domínio determinístico para saldos, lançamentos, projeções, custos de atraso e cenários de pagamento.
4. Supabase Postgres como sistema de registro escolhido; migrações versionadas e RLS em toda tabela exposta.
5. Adaptador de autenticação que avalia Supabase Auth e Privy para login com carteira; uma identidade verificada precisa mapear para o titular da aplicação e preservar RLS.
6. Adaptador cripto de somente leitura para endereços autorizados, snapshots de saldos e fonte/horário de preço.
7. Adaptador LLM isolado; recebe apenas contexto mínimo e resultados estruturados do domínio.
8. CI em GitHub Actions; o deploy permanece fora do escopo até uma decisão posterior.

## Direção de stack

A proposta para avaliação do M00 é Next.js, TypeScript, Node LTS e npm, com Supabase. Esta combinação permite entregar uma aplicação web responsiva e manter autenticação, validação e integrações sensíveis no servidor. O FAI-M00 registrará ADR e poderá ajustar essa proposta antes do scaffold.

## Identidade, carteira e dados

- Supabase é o banco selecionado.
- Privy é o candidato solicitado para autenticação via carteira; validar SIWE/SIWS, renovação de sessão, vinculação de identidade e integração Supabase/RLS antes de produção.
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
