# Brasil Multi Tech — integrações aplicadas ao seu repositório

Este é o SEU repositório (`Reisssz/brasil-multi-tech`), clonado e com as
integrações de backend adicionadas por cima — **nenhum arquivo visual foi
reescrito**. `public/` está intacto com todas as suas fotos reais.

## O que foi adicionado

```
lib/supabase/{client,server,admin,middleware}.ts   — infra de auth
middleware.ts                                       — protege /conta, /checkout, /admin
lib/mercadopago/client.ts
lib/melhor-envio/{client,oauth}.ts

app/login/{page.tsx,actions.ts}
app/cadastro/{page.tsx,actions.ts,verifique-seu-email/page.tsx}
app/auth/confirm/route.ts
app/logout/route.ts
app/conta/page.tsx                                   — histórico de pedidos real

app/api/mercadopago/criar-pagamento/route.ts          — SUBSTITUÍDO (era stub)
app/api/mercadopago/webhook/route.ts                  — SUBSTITUÍDO (era stub)
app/api/frete/route.ts                                — novo (cotação Melhor Envio)
app/api/pedidos/route.ts                              — novo (consulta pedido real)
app/api/integracoes/melhor-envio/callback/route.ts    — novo (OAuth callback)
app/admin/melhor-envio/page.tsx                       — novo (tela de conexão)

app/checkout/page.tsx        — SUBSTITUÍDO: mesmo visual, agora com frete e
                                pagamento reais em vez de localStorage
app/pedido/rastreio/page.tsx — SUBSTITUÍDO: busca o pedido no Supabase em
                                vez de localStorage
components/layout/Header.tsx — 1 ícone de "Minha conta" adicionado, resto intocado
lib/types.ts                 — ProductVariant ganhou campos opcionais de
                                dimensão/peso (weightGrams, widthCm, heightCm,
                                lengthCm) para o cálculo de frete
```

`app/api/mercadopago/criar-pagamento` mudou de contrato em relação ao stub
original: antes esperava um `orderId` pronto; agora ele mesmo cria o pedido
(usuário precisa estar logado — por isso `/checkout` está protegido pelo
middleware).

## ⚠️ Sobre o Next.js 16

O `AGENTS.md` do seu projeto avisa que esta versão do Next.js pode ter
mudanças que não estão no meu treinamento. Se algo em `middleware.ts` ou nas
Server Actions se comportar diferente do esperado, veja
`node_modules/next/dist/docs/` (só existe depois do `npm install`) antes de
assumir que é bug meu.

## Catálogo ainda é mock — e por quê isso é proposital aqui

Você pediu só as integrações de backend, não a migração do catálogo. Então:
- Produtos continuam vindo de `lib/data/products.ts` (local, em memória)
- Os pedidos gravam um **snapshot** dos itens comprados em `orders.items`
  (jsonb) — nome, cor, preço no momento da compra — em vez de referenciar
  uma tabela `products` real, que não existe pra esse catálogo
- **Sem painel admin de produtos** neste pacote (isso só faz sentido depois
  que o catálogo for pro banco — me avisa quando quiser migrar)

## Instalação

```bash
npm install
cp .env.local.example .env.local
# preencha .env.local (ver abaixo)
npm run dev
```

Como adicionei dependências novas ao `package.json`
(`@supabase/ssr`, `@supabase/supabase-js`, `mercadopago`) sem regenerar o
lockfile, rode `npm install` (não `npm ci`) na primeira vez.

## Variáveis que EU NÃO tenho e você precisa preencher

- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API no painel do projeto
  `brasil-multitech`
- `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_WEBHOOK_SECRET` — você
  mencionou já ter pego essas credenciais
- `MELHOR_ENVIO_CLIENT_ID` / `MELHOR_ENVIO_CLIENT_SECRET` — crie o app em
  Integrações → Área Dev, com a URL de callback:
  `https://www.brasilmultitech.com.br/api/integracoes/melhor-envio/callback`
- Endereço real do remetente (`MELHOR_ENVIO_*_REMETENTE`)

## Banco (Supabase, projeto `brasil-multitech`) — o que já está pronto

- `orders` ganhou a coluna `items` (jsonb) para o snapshot dos produtos mock
- Tabela `melhor_envio_tokens` (credenciais OAuth, só `service_role` acessa)
- Todas as policies de RLS já validadas — inclusive um bug que corrigi
  durante a integração: a atualização de `mp_preference_id` em `orders`
  precisa do client admin, porque só existe policy de UPDATE para admin
  nessa tabela (o comprador só pode fazer INSERT/SELECT do próprio pedido)
- 0 alertas de segurança no linter

## Como virar admin (pra acessar /admin/melhor-envio)

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'seu-email@exemplo.com');
```

## Fluxo de ponta a ponta

1. Cliente navega o catálogo mock normalmente (nada mudou aqui)
2. Adiciona ao carrinho → `/checkout`, que agora exige login (middleware)
3. Passo 1 (dados) e passo 2 (entrega) iguais visualmente; no passo 2, o
   botão "Calcular frete" chama `/api/frete` de verdade
4. Passo 3: ao clicar "Finalizar pedido", `/api/mercadopago/criar-pagamento`
   grava o pedido em `orders` (`pending`) e cria a preferência → redireciona
   pro Checkout Pro do Mercado Pago
5. Mercado Pago chama `/api/mercadopago/webhook` → valida assinatura →
   confirma pagamento de verdade → pedido vira `paid`
6. `/pedido/rastreio` busca o pedido real via `/api/pedidos` (autenticado,
   só o dono vê o próprio pedido)

## Pendências que dependem de você

- Compra de etiqueta (Melhor Envio) e painel de gestão de pedidos/produtos
  não entraram neste pacote — foco foi exatamente "login, pagamento, envio"
  como você pediu. Posso adicionar a próxima vez que quiser.
- Dimensões reais de produto: adicionei os campos no tipo
  (`weightGrams`/`widthCm`/etc.) mas nenhum produto em
  `lib/data/products.ts` os preenche ainda — o cálculo de frete usa um
  fallback conservador (15×8×20cm, 400g) até você preencher.
