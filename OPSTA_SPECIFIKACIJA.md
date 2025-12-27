# Opšta specifikacija — Kratak rezime (kontrolna tačka)

Cilj: Implementacija opšte specifikacije i микросервиса производње za информациони систем "Парфимерија О'Сињел Де Ор".

1. Model korisnika
- Jedinstveni identifikator (UUID)
- `username` (jedinstveno), `password` (hashirano), `email`, `firstName`, `lastName`, `profileImage` (base64), `role` (ADMIN, MANAGER, SELLER)

2. Mikroservisi (pregled relevantan za kontrolnu tačku)
- Gateway (routiranje, authN/authZ) — javni
- Auth microservice — prijava/registracija, baza `korisnici`
- User microservice — CRUD nad korisnicima, baza `korisnici`
- Audit microservice — evidencija događaja, baza `audit_logovi`
- Production microservice (OVA KONTROLNA TAČKA) — rad sa entitetom `Plant`, baza `prost_production_db`

3. Entitet `Plant` (microservice proizvodnja)
- `id` UUID (primarni ključ)
- `commonName` (string)
- `aromaticStrength` (decimal 1.00 - 5.00)
- `latinName` (string)
- `originCountry` (string)
- `status` enum (POSADJENA, UBRANA, PRERADJENA)
- `createdAt` timestamp

4. Funkcionalnosti микросервиса производње
- Zasaditi novu biljku (`plantNew`) — nasumično generisana `aromaticStrength` u opsegu 1.00–5.00
- Promeniti jačinu aromatičnih ulja za zadati procenat (`changeAromaticStrengthPercent`) — vrednost ograničena na [1.00,5.00]
- Uberi određeni broj biljaka po latinskom nazivu (`harvestByLatinName`) — menja status u `UBRANA`
- Prikaz liste biljaka
- Svaka relevantna akcija mora slati zahtev za evidenciju događaja u `audit` (zabeleženo kao zahtev za dalje povezivanje)

5. Tehničke napomene i zahtevi
- TypeORM za pristup bazi
- MySQL kao DB engine
- UUID kao tip identifikatora
- Lozinke u bazi moraju biti hashirane (Auth microservice)
- CORS i env konfiguracija čuvati u `.env`
- SOLID i čista arhitektura

6. Šta je urađeno za kontrolnu tačku (repo)
- Scaffold `production-microservice` sa: entitetom, servisom, kontrolerom, validatorima, TypeORM konfiguracijom
- `schema.sql` i `seed.sql` u folderu микросервиса
- `README.md` sa uputstvima za lokalno pokretanje

7. Preporučeni sledeći koraci (za potpunu verifikaciju)
- Podesiti MySQL korisnika/auth plugin (ako je potrebno) ili izvršiti `seed.sql` direktno
- Pokrenuti `npm run start` u `production-microservice` i testirati API
- Implementirati slanje događaja u `audit` микросервис (ako postoji)


