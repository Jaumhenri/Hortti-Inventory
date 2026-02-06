# Hortti Inventory

Aplicação fullstack para gestão de inventário do hortifrúti **Cantinho Verde**.

## Stack

- **Frontend:** React + TypeScript + Tailwind (Vite)
- **Backend:** NestJS + TypeScript
- **Banco:** PostgreSQL
- **Auth:** JWT

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (ou Docker)

## Como rodar (Docker - opcional)

1. Suba os serviços:
   - `docker compose up --build`
2. O Postgres executa `sql/schema.sql` + `sql/seed.sql` automaticamente **na primeira inicialização** do volume.
   - Se você já tiver criado o volume, rode manualmente:
     - `psql "postgres://hortti:hortti@localhost:5432/hortti_inventory" -f sql/schema.sql -f sql/seed.sql`
3. Abra:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

## Como rodar (Local)

### 1) Banco

Crie o banco `hortti_inventory` e rode:

- `psql "<sua-conn-string>" -f sql/schema.sql -f sql/seed.sql`

### 2) Backend

Em um terminal:

- `cd backend`
- `cp .env.example .env` (ajuste se necessário)
- `npm install`
- `npm run start:dev`

### 3) Frontend

Em outro terminal:

- `cd frontend`
- `cp .env.example .env`
- `npm install`
- `npm run dev`

## Credenciais (seed)

- Usuário: `admin`
- Senha: `admin123`

## Endpoints principais

### Auth

- `POST /auth/login`
  - body: `{ "username": "admin", "password": "admin123" }`
  - resposta: `{ "accessToken": "..." }`

### Produtos

- `GET /products?q=banana&sort=price&order=asc`
- `GET /products/:id`
- `POST /products` (JWT)
  - `multipart/form-data`: `name`, `category`, `price`, `image` (opcional)
- `PUT /products/:id` (JWT)
  - JSON: `name?`, `category?`, `price?`
- `PUT /products/:id/image` (JWT)
  - `multipart/form-data`: `image` (obrigatório)
- `DELETE /products/:id` (JWT)

### Curl rápido

1) Login:

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

2) Criar produto (com imagem):

```bash
TOKEN="...cole_o_token..."
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "name=Uva" \
  -F "category=fruta" \
  -F "price=12.90" \
  -F "image=@/caminho/para/imagem.jpg"
```

## Testes

Backend:

- `cd backend && npm test`
