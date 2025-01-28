## v_0.1.0
1. enable exact text search for product name in postgreSql
2. the db folder contains the sql script to create the database and table
    2.1 schema.sql is the schema of the database
    2.2 seed.sql is the data to populate the database
    2.3 spacial_index.sql is the script to create the spatial index for the shops table
3. to test the app locally, the mock api is under `frontend/src/services/inventory.ts`
4. search api for psql:
    4.1 frontend/src/app/api/search/route.ts is the api to search for products by name
    4.2 only support exact match for now

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

In this version the backend is using postgreSql, you need to set the DATABASE_URL in the .env.local file.

.env example:
```
DATABASE_URL=postgresql://username:password@localhost:5432/localmart
```
