# Segurança e privacidade

Status: proposta atualizada — classificação ELEVATED, pois o produto processará dados financeiros sensíveis e apoiará decisões. Pagamentos automáticos não existem.

## Dados protegidos

Saldos, transações, credores, renda, endereços de carteira associados ao titular e comportamento financeiro são sensíveis. O repositório público contém somente código, documentação e dados sintéticos.

## Controles obrigatórios

- Sessão Supabase SSR com renovação via `getClaims()` no Proxy; dashboard revalida a sessão com `getUser()` e exige `FINANCE_AI_OWNER_USER_ID` e registro na allowlist privada no banco.
- Supabase RLS habilitado em todas as tabelas expostas e políticas que autorizem titular e espaço no banco.
- Testes contra IDOR/BOLA alterando IDs do cliente; não confiar somente em filtros da API ou UI.
- Não usar user_metadata editável pelo usuário para autorização.
- Chaves service-role, assinatura JWT e segredos ficam apenas no servidor/cofre; nunca no bundle ou cliente.
- Toda operação verifica identidade, titular e espaço no servidor.
- Criptografia em trânsito e em repouso fornecida por infraestrutura revisada.
- Exportação, exclusão, backup e restauração testados antes de dados reais.
- Auditoria sem valores completos, credenciais ou descrições sensíveis.
- Threat model e resposta a incidente definidos antes de produção.
- Repositório público e CI não recebem saldo real, extrato, endereço de carteira de produção, token ou seed phrase.
- Carteira é somente leitura. A assinatura Web3 de login pode ser usada apenas como desafio de autenticação, sem autorização de transação.
- Nunca solicitar, armazenar ou registrar seed phrase, chave privada ou senha de carteira.
- Logs e erros não guardam tokens, cabeçalhos de autorização ou dados financeiros brutos.
- Dependências e GitHub Actions usam SHAs completos; Dependabot mantém referências atualizadas.
- Workflows usam pull_request, permissões mínimas e nenhum segredo em execução de código de fork.
- Provedores de IA só recebem o mínimo de dados necessário; entrada de extrato é conteúdo não confiável.
- Cloudinary não armazena extratos CSV; só avaliar imagem aprovada com upload assinado e retenção curta.

## IA e conteúdo não confiável

- IA não recebe credenciais bancárias, tokens de sessão ou contexto além do mínimo necessário.
- IA não calcula juros, ranking ou saldo final; funções determinísticas produzem resultados tipados.
- Descrições e arquivos importados não alteram permissões nem instruções de sistema.
- IA pode consultar dados autorizados e preparar rascunhos. Toda gravação exige confirmação.
- Nenhum endpoint, segredo ou ferramenta permite pagamento, transferência ou contratação de crédito.

## Integração cripto

Endereços públicos são associados a identidade e merecem proteção. Validar posse com o protocolo do provedor e armazenar apenas o vínculo e os saldos necessários. Nenhuma capacidade de assinar transação ou movimentar fundos deve existir.

## Resposta a incidentes

Antes de produção, definir revogação de credenciais, restauração, exclusão, comunicação e canal de suporte. Se dado real vazar, interromper publicação, preservar evidência e revogar credenciais afetadas antes de seguir.

## Restrição a um único titular no banco

A política de `finance_spaces` exige **duas condições independentes**: `auth.uid() = owner_id` e presença do usuário autenticado na tabela `finance_private.authorized_owners`. A tabela privada aceita somente um registro, não está exposta pela Data API e só pode ser alterada por administração privilegiada. A função `public.finance_is_authorized_owner()` é `SECURITY DEFINER`, com `search_path` vazio, e retorna apenas autorização para a identidade de quem chama. Contas Web3 autenticadas, mas não provisionadas, não podem criar nem ler espaços, mesmo próprios.

O servidor exige ainda `FINANCE_AI_OWNER_USER_ID` e usa `auth.getUser()` para validar sessão ativa. O identificador real do titular nunca deve ser incluído no repositório nem em logs públicos. Testes usam identidades sintéticas e verificam acesso negado antes do provisionamento e para outra carteira.

O [modelo inicial de ameaças do M00](threat-model-m00.md) documenta ativos, fronteiras de confiança, riscos e gates pendentes. O [contrato M00](contracts-m00.md) registra as interfaces efetivamente implementadas e as lacunas que permanecem para módulos posteriores.
