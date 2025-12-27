# Production Microservice

Mikroservis za proizvodnju biljaka (proizvodnja parfema) — minimalni scaffold za kontrolnu tačku.

## Sadržaj
- `src/` - izvorni kod
- `.env.example` - primer konfiguracije
- `schema.sql` - SQL šema tabele `plants`

## Entitet `plants`
- `id` (UUID) - primarni ključ
- `common_name` - opšti naziv
- `aromatic_strength` - jačina aroma (1.00 - 5.00)
- `latin_name` - latinski naziv
- `origin_country` - zemlja porekla
- `status` - POSADJENA | UBRANA | PRERADJENA
- `created_at` - datum kreiranja

## Pokretanje lokalno
1. Kopirati `.env.example` u `.env` i podesiti konekciju ka MySQL bazi.
2. Kreirati bazu podataka navedenu u `DB_NAME` ili koristiti `schema.sql` da napravite tabelu.
3. Instalirati zavisnosti i pokrenuti servis iz foldera `production-microservice`:

```bash
npm install
npm run start
```

### Pokretanje seed skripte
Nakon što je baza dostupna i `.env` podesjen, ubacite inicijalne podatke:

```bash
npm run seed
```

## API (osnovno)
- `POST /api/v1/production/plant` body: `{ commonName, latinName, originCountry }` - zasadi novu biljku
- `POST /api/v1/production/change-strength` body: `{ plantId, percent }` - promeni jačinu za procenat
- `POST /api/v1/production/harvest` body: `{ latinName, count }` - uberi `count` biljaka iste vrste
- `GET /api/v1/production/plants` - lista biljaka

## Napomene
- Entitet koristi UUID kao primarni ključ (ne-sekvenicioni)
- Sva validacija ulaza se vrši u `src/WebAPI/validators`
- TypeORM se koristi za pristup bazi (konfiguracija u `src/Database`)
