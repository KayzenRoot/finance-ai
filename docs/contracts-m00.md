# M00 — Contratos compartilhados da fundação

Work Order: `FAI-WO-M00-001`. Estado: fundação M00 integrada por squash pela PR #16 em `04797f1d058b5a37586383b60a5a3e6dc4037926`, com 10/10 checks e política de zero aprovações humanas. Interfaces financeiras M01 são contrato separado.

## Fronteiras verificáveis

| Interface | Contrato atual | Verificação |
|---|---|---|
| Identidade | Supabase Auth Web3, desafio de assinatura para EVM/Solana; `auth.uid()` é o UUID do usuário validado | Smoke EVM sintético no CI; Solana real ainda não testado |
| Sessão web | Servidor usa `auth.getUser()` e rejeita sessão inválida; Proxy atualiza sessão | Build/typecheck e inspeção de código; E2E de revogação de sessão ainda pendente |
| Titular único | O UUID exige igualdade com `FINANCE_AI_OWNER_USER_ID` no servidor **e** provisionamento administrativo no banco | Teste de RLS + RPC `finance_is_authorized_owner()` |
| Espaços | `public.finance_spaces` expõe `id: uuid`, `owner_id: uuid`, `space_type: personal \| store`, `display_name: string[1..80]`, `created_at: timestamptz` | Migração SQL, testes pgTAP/PGlite |
| Escopo | No máximo um espaço de cada tipo por `owner_id`; a criação efetiva pertence ao módulo M01; nenhuma carteira não provisionada pode criar ou acessar espaços | `unique(owner_id,space_type)` e quatro políticas RLS |
| Administração | `finance_private.authorized_owners` aceita no máximo um registro e não é concedida a usuários web | Constraint `singleton`, schema privado, grant/revoke explícitos |
| Consulta de autorização | `public.finance_is_authorized_owner(): boolean`; sem parâmetro de ID, usa a identidade JWT ativa | Teste RPC com duas carteiras sintéticas |

## Regras para o M01 e módulos posteriores

1. O cliente jamais define sozinho o titular efetivo: verificar sessão no servidor e impor `auth.uid()` + titular provisionado no Postgres.
2. Toda tabela financeira exposta herda o isolamento de titular e o vínculo de espaço, com testes de criação, consulta, alteração, exclusão e acesso cruzado na **Data API**.
3. Dados financeiros nunca ficam no bundle, em logs públicos, em fixtures identificáveis ou nos workflows do GitHub.
4. `FINANCE_AI_OWNER_USER_ID` é configuração privada de servidor, não substitui RLS. Nenhuma função service-role no navegador.
5. Os tipos monetários permanecem em centavos inteiros ou decimal exato; nenhum cálculo de domínio depende de LLM.
6. API de pagamento, transação assinada e integração Open Finance não existem nesta fase; nenhuma evolução os adiciona sem novo escopo e gate.
7. Mudanças neste contrato exigem ADR, testes negativos e atualização dos documentos canônicos. Não gerar endpoints de domínio sem Work Order M01.

## Lacunas deliberadas

M00 não implementa contas financeiras, lançamentos, endpoints de negócio, adaptador de IA nem serviço hospedado. As interfaces desses módulos serão especificadas em seus Work Orders; este documento não as anuncia como existentes. Não há prova de uso em carteira Solana real, backup de produção ou testes E2E em navegador. Proteção da main e cinco required checks foram comprovados no GitHub.
