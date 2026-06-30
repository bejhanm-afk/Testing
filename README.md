# CMS / Website-builder SaaS

Een modern, multi-tenant website-builder platform (vergelijkbaar met
WordPress/Wix, maar zelf-gehost). Eindgebruikers maken een account, kiezen een
template en bouwen hun eigen website met een blok-gebaseerde page builder. Elke
site draait op een eigen subdomein of custom domain.

## Tech stack

- **Next.js 14** (App Router) — frontend, admin, API en publieke rendering
- **PostgreSQL + Prisma** — multi-tenant datamodel (`siteId` per tenant)
- **NextAuth.js** — authenticatie met rollen (super-admin, site-owner, editor)
- **Tailwind CSS** — styling
- **Lokale storage** (S3-ready abstractie) — media uploads

## Architectuur in het kort

Eén Next.js-app bedient drie "werelden", gerouteerd op de `Host`-header via
`src/middleware.ts`:

| Wereld          | Host                        | Doel                                   |
| --------------- | --------------------------- | -------------------------------------- |
| Platform-app    | `app.<root>` / root         | Login, dashboards, page builder, admin |
| Publieke sites  | `*.<root>` + custom domains | SSR-gerenderde tenant-websites         |
| API             | `/api/*`                    | Route handlers (backend)               |

Tenant-hosts worden door de middleware herschreven naar
`/site/<key>/<pad>`, waar de publieke renderer de juiste `Site` + `Page`
opzoekt en de blokken server-side rendert (SEO-vriendelijk).

### Multi-tenancy

Shared database / shared schema met een `siteId`-discriminator op alle
tenant-tabellen. Isolatie wordt afgedwongen via `src/lib/authz.ts`
(`assertSiteAccess`) — geen enkele tenant-query vertrouwt een client-opgegeven
`siteId` zonder membership-check.

### Rollen

- **super-admin** (`User.globalRole = SUPER_ADMIN`) — platformbeheer, alle sites
- **site-owner** (`Membership.role = OWNER`) — volledig beheer eigen site(s)
- **editor** (`Membership.role = EDITOR`) — content bewerken, geen settings/billing

### Blocks & pagina's

Pagina's slaan content op als JSON-array van block-instances
(`[{ id, type, data }]`) in `Page.content`. De catalogus van blocktypes leeft in
`src/blocks/definitions.ts` (single source of truth voor seed, builder en
renderer). `src/blocks/Renderer.tsx` mapt `type` → React-component.

## Mappenstructuur

```
prisma/
  schema.prisma          # datamodel
  seed.ts                # blocks-catalogus, demo-templates, super-admin
src/
  middleware.ts          # host-gebaseerde tenant-routing
  app/
    (platform)/          # platform-app (login, dashboard, admin)
    site/[key]/[[...slug]]/   # publieke tenant-renderer (via rewrite)
    api/                 # auth, register, sites
  blocks/                # block-definities + renderer
  components/            # UI + formulieren
  lib/                   # db, auth, authz, tenant/host, storage
  types/                 # NextAuth type-augmentatie
```

## Lokaal draaien

1. **Vereisten:** Node 18+, PostgreSQL.
2. **Env:** kopieer `.env.example` naar `.env` en vul `DATABASE_URL` +
   `NEXTAUTH_SECRET` in.
3. **Installeren & DB:**
   ```bash
   npm install
   npm run db:push        # of: npm run db:migrate
   npm run db:seed
   npm run dev
   ```
4. **Inloggen als super-admin:** `admin@platform.nl` / `admin1234`
   (aangemaakt door de seed — wijzig dit in productie).

### Subdomeinen lokaal testen

Subdomein-routing werkt via de `Host`-header. Lokaal kun je `*.localhost`
gebruiken (de meeste browsers routeren `iets.localhost` naar `127.0.0.1`):
open bijvoorbeeld `http://mijnsite.localhost:3000`.

## Bouwfasen

- [x] **Fase 0** — Project-init, Prisma-schema, seed
- [x] **Fase 1** — Authenticatie + multi-tenancy (sites aanmaken, rollen, publieke rendering-basis)
- [ ] **Fase 2** — Template/block-systeem + drag & drop page builder
- [ ] **Fase 3** — Publieke SSR-rendering uitbouwen (custom domains, navigatie)
- [ ] **Fase 4** — Site-owner dashboard (media library, settings, team)
- [ ] **Fase 5** — Admin paneel + Stripe-abonnementen + statistieken

> Stripe is voorlopig gestubd (`STRIPE_ENABLED=false`); het `Subscription`-model
> en de tiers staan al in de database.
