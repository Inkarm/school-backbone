---
description: Deploy aplikacji Next.js na Vercel
---

# Deployment aplikacji School Backbone na Vercel

Ten workflow przeprowadzi Cię przez proces deploymentu aplikacji Next.js z Prisma na Vercel.

## Wymagania wstępne

- Konto GitHub (darmowe)
- Konto Vercel (darmowe)
- Działająca aplikacja lokalnie

---

## Krok 1: Przygotowanie bazy danych

⚠️ **WAŻNE**: Vercel nie wspiera SQLite. Musisz przejść na PostgreSQL.

### 1.1. Utworzenie darmowej bazy PostgreSQL

Wybierz jedną z opcji:

**Opcja A: Vercel Postgres (ZALECANE)**
1. Zaloguj się na https://vercel.com
2. Przejdź do Dashboard → Storage → Create Database
3. Wybierz "Postgres"
4. Wybierz region (najlepiej blisko użytkowników)
5. Zapisz connection string (dostępny w zakładce ".env.local")

**Opcja B: Neon (darmowy PostgreSQL)**
1. Utwórz konto na https://neon.tech
2. Utwórz nowy projekt
3. Skopiuj connection string (format: `postgresql://user:pass@host/db?sslmode=require`)

### 1.2. Aktualizacja schema Prisma

Otwórz `prisma/schema.prisma` i zmień:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.3. Utworzenie pliku .env.local

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

Wklej swój connection string z kroku 1.1.

### 1.4. Migracja danych (jeśli masz istniejące dane)

Jeśli masz dane w SQLite, które chcesz zachować:

```bash
# 1. Wygeneruj SQL z obecnej bazy
npx prisma db pull

# 2. Zastosuj migrację na nowej bazie PostgreSQL
npx prisma migrate dev --name init

# 3. (Opcjonalnie) Użyj narzędzia do migracji danych
# Np. eksportuj do CSV i importuj do PostgreSQL
```

Jeśli zaczynasz od zera:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 1.5. Testowanie lokalnie z PostgreSQL

```bash
# Usuń starą bazę SQLite (opcjonalnie)
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue

# Uruchom aplikację
npm run dev
```

Sprawdź czy wszystko działa poprawnie na http://localhost:3000

---

## Krok 2: Przygotowanie repozytorium GitHub

### 2.1. Utworzenie pliku .gitignore

Sprawdź czy `.gitignore` zawiera:

```gitignore
# dependencies
/node_modules

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/*.db
prisma/*.db-journal
```

### 2.2. Inicjalizacja Git (jeśli jeszcze nie masz repo)

```bash
git init
git add .
git commit -m "Initial commit - School Backbone"
```

### 2.3. Utworzenie repozytorium na GitHub

1. Przejdź na https://github.com/new
2. Nazwij repo np. "school-backbone"
3. **NIE** inicjalizuj z README (już masz lokalnie)
4. Kliknij "Create repository"

### 2.4. Push do GitHub

```bash
# Zastąp YOUR_USERNAME swoim username GitHub
git remote add origin https://github.com/YOUR_USERNAME/school-backbone.git
git branch -M main
git push -u origin main
```

---

## Krok 3: Deployment na Vercel

### 3.1. Import projektu do Vercel

1. Przejdź na https://vercel.com/new
2. Zaloguj się przez GitHub
3. Zautoryzuj Vercel do dostępu do swoich repozytoriów
4. Wybierz repozytorium "school-backbone"
5. Kliknij "Import"

### 3.2. Konfiguracja projektu

Na ekranie konfiguracji:

**Framework Preset**: Next.js (powinno wykryć automatycznie)

**Root Directory**: ./

**Build Command**: `npm run build` lub `next build`

**Output Directory**: (zostaw puste, domyślnie `.next`)

**Install Command**: `npm install`

### 3.3. Dodanie zmiennych środowiskowych

W sekcji "Environment Variables":

1. Kliknij "Add"
2. Dodaj:
   - **Name**: `DATABASE_URL`
   - **Value**: Twój connection string z kroku 1.1
   - **Environment**: Production, Preview, Development (zaznacz wszystkie)

3. (Opcjonalnie) Jeśli masz inne zmienne, dodaj je tutaj

### 3.4. Deploy

1. Kliknij "Deploy"
2. Poczekaj 2-5 minut na zakończenie budowania
3. Po zakończeniu zobaczysz URL typu: `https://school-backbone-xxxx.vercel.app`

### 3.5. Uruchomienie migracji Prisma na produkcji

⚠️ **WAŻNE**: Po pierwszym deploymencie musisz uruchomić migracje:

**Opcja A: Przez Vercel CLI (zalecane)**

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Zaloguj się
vercel login

# Link projektu
vercel link

# Uruchom migracje na produkcji
vercel env pull .env.production
npx prisma migrate deploy
```

**Opcja B: Przez build hook**

Możesz dodać do `package.json` w sekcji `scripts`:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Vercel automatycznie uruchomi migracje przy każdym deploymencie.

---

## Krok 4: Weryfikacja

### 4.1. Sprawdzenie działania aplikacji

1. Otwórz URL z Vercel w przeglądarce
2. Przetestuj główne funkcje:
   - Logowanie
   - Dodawanie studentów
   - Plan zajęć
   - Obecności
   - Raporty finansowe

### 4.2. Sprawdzenie logów

Jeśli coś nie działa:

1. Przejdź do Dashboard Vercel
2. Wybierz projekt "school-backbone"
3. Kliknij zakładkę "Deployments"
4. Kliknij na najnowszy deployment
5. Sprawdź "Build Logs" i "Function Logs"

---

## Krok 5: Aktualizacje (następne deploymenty)

Po każdej zmianie w kodzie:

```bash
# 1. Commituj zmiany lokalnie
git add .
git commit -m "Opis zmian"

# 2. Push do GitHub
git push

# 3. Vercel automatycznie zbuduje i wdroży nową wersję!
```

Vercel automatycznie:
- Wykrywa zmiany w repo GitHub
- Buduje nową wersję
- Deployuje na produkcję
- Tworzy preview URL dla pull requestów

---

## Krok 6: Domena własna (opcjonalne)

### 6.1. Dodanie domeny z cyberfolks

1. W Dashboard Vercel przejdź do Settings → Domains
2. Kliknij "Add"
3. Wpisz swoją domenę (np. `school.example.com`)
4. Vercel pokaże rekordy DNS do dodania

### 6.2. Konfiguracja DNS w cyberfolks

W panelu cyberfolks dodaj rekordy:

**Dla subdomeny (np. school.example.com):**
```
Type: CNAME
Name: school
Value: cname.vercel-dns.com
```

**Dla głównej domeny (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

Propagacja DNS może zająć do 48h (zazwyczaj kilka minut).

---

## Rozwiązywanie problemów

### Build fails z błędem Prisma

Dodaj do `package.json`:
```json
"postinstall": "prisma generate"
```

### Database connection errors

Sprawdź czy:
- `DATABASE_URL` jest poprawnie ustawiony w Environment Variables
- Connection string zawiera `?sslmode=require`
- Baza danych jest dostępna publicznie

### 404 na API routes

Sprawdź strukturę folderów - API routes muszą być w `src/app/api/` lub `app/api/`

---

## Przydatne linki

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Dokumentacja Vercel + Next.js**: https://vercel.com/docs/frameworks/nextjs
- **Dokumentacja Prisma + Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Vercel CLI docs**: https://vercel.com/docs/cli

---

## 🎉 Gotowe!

Twoja aplikacja jest teraz dostępna online i automatycznie aktualizowana przy każdym push do GitHub!
