# M00 — Modelo inicial de ameaças

Work Order: `FAI-WO-M00-001`. Escopo: login com carteira, sessões web, `finance_spaces`, Supabase local e pipeline público. **Nenhum dado financeiro de produção é permitido.** Avaliação inicial interna, não substitui revisão independente.

## Ativos e fronteiras de confiança

Ativos: identidade vinculada à carteira, sessão Supabase, UUID do titular, registros financeiros futuros, segredos de infraestrutura e integridade das migrações. Fronteiras: carteira/extensão não confiável → Supabase Auth; navegador/cookies → servidor Next; sessão JWT → Data API/RLS; GitHub Actions público → ambiente local sintético. A conta autenticada **não é** automaticamente o titular autorizado.

| Ameaça | Severidade antes do controle | Controle e evidência | Risco ou gate restante |
|---|---|---|---|
| Outra carteira autentica e cria seu próprio espaço | HIGH | Registro privado de único titular; políticas RLS exigem `auth.uid()` e `finance_is_authorized_owner()`; pgTAP, PGlite e Data API negam acesso | Testar revogação e todas as novas tabelas financeiras |
| IDOR/BOLA entre titular e espaço | HIGH | Políticas RLS de SELECT/INSERT/UPDATE/DELETE e testes com duas identidades sintéticas | Repetir por recurso em M01+; não confiar em filtros visuais |
| JWT expirado, sessão revogada, cookies roubados | HIGH | `getUser()` no dashboard; Proxy atualiza sessão | E2E para revogação/expiração, flags de cookie, XSS e CSRF antes de dados reais |
| Comprometimento de provedor ou assinatura enganosa | HIGH | Mensagem de login sem autorização financeira, validação pelo Supabase, sem seed ou chave privada na aplicação | Testar Solana e provedores reais; proteger domínio HTTPS e comunicar origem/nonce |
| Função SQL `SECURITY DEFINER` escalando privilégios | HIGH | `search_path = ''`; referências qualificadas; função não recebe ID arbitrário; tabela privada sem grants | Revisar privilégios e owner real no Supabase hospedado; testar chamada anônima |
| Segredos ou dados sensíveis publicados em CI/Git | HIGH | Dados sintéticos, `.gitignore`, ausência de segredo de produção; análise CodeQL e Dependabot | Confirmar secret scanning/push protection; revisar run histórico com chave local efêmera |
| Dependência, action ou PR comprometidos | HIGH | GitHub Actions com SHA fixo, permissões mínimas, npm audit, Dependency Review, CodeQL, Socket | `main` não protegida; exigir PR/checks e bloquear force-push/deleção |
| Falha de backup, corrupção ou indisponibilidade | HIGH | Migrações versionadas, dump/restore de linha sintética no CI | Sem backup independente hospedado nem RPO/RTO comprovados; impede dados reais |
| Prompt injection e decisões financeiras incorretas | HIGH (futuro) | Domínio determinístico e confirmação humana exigidos no Scope | Implementação fora de M00; novos testes em M05/M06/M09 |
| Carteira/cripto confundida com caixa disponível | STANDARD (futuro) | Separação por contrato/escopo | Exigir snapshots com fonte e tempo em M11; não há código ainda |

## Gate e resposta a incidentes

- **Antes de merge:** CI verde no HEAD, revisão de diffs/segurança, contratos sem divergência, required checks/branch protection comprovados e decisão explícita do auditor.
- **Antes de dados reais:** ambiente privado com HTTPS, acesso do titular provisionado, secret scanning/push protection, integração Auth/RLS testada, backup criptografado independente e restauração, plano de retenção/RPO/RTO, revogação operacional e observabilidade sem dados sensíveis.
- **Incidente:** cessar deploy e gravações, revogar credenciais e sessões comprometidas, preservar evidências sem divulgar segredos, corrigir permissões e restaurar de fonte independente após verificação. Registrar decisão e notificar titular.
- **Sem inferência:** CI verde de dados sintéticos **não prova** hardening de produção, resiliência de backup, ausência de vulnerabilidades nem validação visual.
