# Implantação e operação

Status: scaffold local e fundação de CI em implementação; não há projeto Supabase de produção nem deploy. A plataforma será decidida em ADR separado.

## Banco e autenticação

Supabase Postgres está selecionado. Conforme a [página de preços](https://supabase.com/pricing) e a [documentação de projetos pausados](https://supabase.com/docs/guides/platform/going-into-prod#paused-projects), Free pode pausar um projeto após uma semana de inatividade e não inclui backups automáticos diários nem PITR. A documentação indica janela de restauração de um ano para projeto pausado; isso não substitui backup. Revalidar limites antes de produção.

O scaffold usa Supabase Auth Web3 nativo para Ethereum e Solana. A assinatura de mensagem confirma identidade e não habilita transferências. O painel permanece fechado até configurar a identidade do titular no ambiente privado do servidor. Nunca pedir chave privada ou seed phrase.

Antes de inserir dados reais, selecionar armazenamento independente, criptografia, janela de retenção e rotina de exportação, testar restauração isolada e documentar RPO/RTO. O CI ensaia exportação e restauração de uma linha sintética; essa prova não é backup de produção nem rotina agendada.

## Imagens

A V1 não exige imagem. Cloudinary só será configurado se uma funcionalidade de imagem for aprovada; não guardar extratos bancários em mídia. Definir upload assinado, limite de tipo/tamanho e retenção.

## Gate de implantação

- Ambiente privado com HTTPS e autenticação verificada.
- RLS e isolamento por titular testados no banco.
- Segredos ausentes do repositório e bundle do navegador.
- Migrações versionadas e testadas em banco de desenvolvimento isolado.
- Logs sem dados financeiros, carteiras ou credenciais detalhadas.
- Backup independente, retenção definida e restauração ensaiada.
- Dependabot e alertas de segurança ativos; required checks exigidos em `main`.
- Exportação e exclusão verificadas.
- Monitoramento de erros e limites de custo de IA/provedores.
- Staging apenas com dados sintéticos.
- Rollback da aplicação e roll-forward de migrações documentados.
- Testes em celular e computador.
- Titular confirma saldos e importações antes de usar recomendações.

## Operação V1

Sem pagamentos, sincronização bancária automática, assinatura de transação ou automação de decisão financeira. Open Finance exige gate próprio de viabilidade, consentimento, parceiro, segurança, custo e suporte. Reavaliar custos e limites de GitHub Actions antes de tornar privado o repositório.
