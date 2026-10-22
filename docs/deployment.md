# Implantação e operação

Status: ainda não há aplicação ou deploy. A plataforma de hospedagem será decidida depois do scaffold.

## Banco e autenticação

Supabase Postgres está selecionado. O plano Free atual, consultado em 2026-10-22, inclui limites de uso e projetos, pode pausar projeto após uma semana inativo e não oferece backup diário incluído; validar a página de preços novamente antes de armazenar dados reais. O MVP precisa de exportação e backup independente, criptografado e com restauração testada. Se não houver uma estratégia confiável dentro do plano gratuito, não armazenar dados reais até resolver a lacuna.

Privy é o candidato para login com carteira. Sua integração com Supabase e RLS deve ser provada no M00. Verificar custo, quotas e política de sessão antes de produção. Nunca pedir chave privada ou seed phrase.

## Imagens

A V1 não exige imagem. Cloudinary só será configurado se uma funcionalidade de imagem for aprovada; não guardar extratos bancários em mídia. Definir upload assinado, limite de tipo/tamanho e retenção.

## Gate de implantação

- Ambiente privado com HTTPS e autenticação verificada.
- RLS e isolamento por titular testados no banco.
- Segredos ausentes do repositório e bundle do navegador.
- Migrações versionadas e testadas em banco de desenvolvimento isolado.
- Logs sem dados financeiros, carteiras ou credenciais detalhadas.
- Backup independente, retenção definida e restauração ensaiada.
- Exportação e exclusão verificadas.
- Monitoramento de erros e limites de custo de IA/provedores.
- Staging apenas com dados sintéticos.
- Rollback da aplicação e roll-forward de migrações documentados.
- Testes em celular e computador.
- Titular confirma saldos e importações antes de usar recomendações.

## Operação V1

Sem pagamentos, sincronização bancária automática, assinatura de transação ou automação de decisão financeira. Open Finance exige gate próprio de viabilidade, consentimento, parceiro, segurança, custo e suporte. Reavaliar custos e limites de GitHub Actions antes de tornar privado o repositório.
