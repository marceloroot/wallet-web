# Carteira Web

Frontend da carteira digital, feito com **Next.js**. Consome a API Laravel (autenticação, saldo, depósito, transferência e histórico de transações).

## Requisitos

- [Node.js](https://nodejs.org/) 20+
- API Laravel rodando (padrão: `http://localhost:8000/api`)
- Para Docker: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose)

## Variáveis de ambiente

Copie o exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da API acessível pelo navegador (ex.: `http://localhost:8000/api`) |
| `PORT` | Porta no host ao usar Docker (padrão: `3000`) |

## Rodar localmente (desenvolvimento)

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Rodar com Docker

1. Garanta que a API Laravel está acessível (no host ou em outro container).
2. Configure o `.env` se a URL da API for diferente do padrão.
3. Suba o frontend:

```bash
docker compose up --build
```

Acesse [http://localhost:3000](http://localhost:3000).

### Comandos úteis

```bash
# Em segundo plano
docker compose up -d --build

# Parar
docker compose down

# Rebuild (obrigatório após alterar NEXT_PUBLIC_API_URL)
docker compose build --no-cache && docker compose up -d
```

> **Nota:** `NEXT_PUBLIC_API_URL` é definida no **build** da imagem. Se mudar essa variável, rode o build novamente com `--no-cache`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção (após o build) |
| `npm run lint` | ESLint |

## Estrutura principal

```
src/
  app/           # Páginas (login, registro, dashboard)
  components/    # UI e layout
  contexts/      # Autenticação
  lib/           # Cliente da API e utilitários
```
