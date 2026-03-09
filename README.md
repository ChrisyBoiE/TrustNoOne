# Trust No One 🤫

🔥 **Próbáld ki élőben:** [https://trust-no-one-vert.vercel.app/](https://trust-no-one-vert.vercel.app/)

## Mi ez a projekt?

A **Trust No One** egy pörgős, izgalmas, asztali társasjátékok inspirálta "Social Deduction" (közösségi dedukciós) partijáték, amit baráti társaságoknak fejlesztettem. A játékmenet leginkább a *Spyfall* vagy a *Fake Artist* mechanikájára hasonlít, de egyedi csavarokkal!

**A játék lényege:** 
Minden kör elején a rendszer sorsol egy titkos szót (például: "Denevér"), amit mindenki megkap a telefonjára – **kivéve az imposztort!** Az imposztor nem tudja az eredeti szót, csak a kategóriáját (pl. "Filmek") és egy nagyon apró "tippet" (pl. "Állat vagy szuperhős?"). 

A játékosok feladata, hogy egy időzített beszélgetés során rájöjjenek, ki az a személy közöttük, aki nem ismeri az eredeti szót, mert csak "kamuzik", miközben a témáról beszélnek. Eközben vigyázniuk kell arra is, hogy túl egyértelműen se beszéljenek a szóról, mert ha az imposztor kitalálja a titkos szót, akkor ő nyeri a kört!

---

## 🎮 Játékmódok

A játéknak alapvetően két nagy módja van:

1. 📱 **Klasszikus (Közös telefon):** 
   Amikor egy társaság fizikailag is egy helyen van, és senki sem akar a saját telefonjával játszani. A rendszer egyetlen készüléken fut, amit a játékosok a kártyájuk (a titkos szó) megtekintése után sorban átadnak a mellettük ülőnek (Pass-the-Phone szerűen).

2. 🌍 **Online (Saját telefonon):**
   Mindenki a saját telefonján játszik! A **Házigazda (👑)** létrehoz egy 5 betűs, egyedi kóddal rendelkező szobát a *Lobby*-ban, amihez bárki csatlakozhat. A telefonok képernyője a Host irányítása alatt századmásodperc pontossággal, valós időben vált, így mindenki egyszerre kapja meg a titkos kártyáit, és együtt figyelhetik az időzítőt is.

**Az Online játékon belül két altípus létezik:**
- **Laza (Casual):** Egy körös, azonnali lezárású játék (felfedés után vége a játéknak).
- **Verseny (Competitive):** Több körös mód (a Host beállíthatja, hányszor fussanak neki a szónak). Jellemzője a beépített pontozási rendszer, a **kötelező szavazás** az idő lejárta után és a legvégén a top 3 játékost kihirdető, CSS-animált látványos **Dobogó**!

---

## 💻 Üzemeltetés és Fejlesztés

A projekt frontend oldalon a legmodernebb **React + Vite** környezetben íródott, míg az online funkcionalitást és a valós idejű WebSocket szinkronizációt a **Supabase (PostgreSQL)** szolgáltatja.

### Fejlesztői Környezet elindítása (Localhost)

1. **Klónozd le a projektet** és lépj be a mappába.
2. **Telepítsd a függőségeket:**
   ```bash
   npm install
   ```
3. **Indítsd el a dev szervert:**
   ```bash
   npm run dev
   ```

*(Megjegyzés: Ha telefonról is meg akarod tekinteni a lokális hálózaton (WiFi), indítsd a szervert az `npm run dev -- --host` paranccsal!)*

---

### ☁️ Supabase beállítása (Szerver / Adatbázis konfiguráció)

Ahhoz, hogy az **Online Játékmódok** működjenek (szoba létrehozása, csatlakozás, valós idejű állapotfrissítések), egy működő Supabase projektre van szükséged. Ezen túl az egyedi módosítások után érdemes a `Vercel`-en is megadni az Environment változókat.

#### 1. lépés: Környezeti változók (.env.local)
A főkönyvtárban hozz létre egy `.env.local` nevű fájlt (példa a `.env.local.example` fájl alapján):

```env
VITE_SUPABASE_URL=a_te_supabase_projekt_hivatkozasod
VITE_SUPABASE_ANON_KEY=a_te_anonim_kliens_kulcsod
```

#### 2. lépés: Adatbázis tábla létrehozása (SQL)
A Supabase felületén az **SQL Editorban** futtasd le az alábbi kódot. Ez létrehozza a `rooms` táblát, ami JSONB formátumban tárolja a dinamikusan bővíthető állapotgépet és a beállításokat.

```sql
-- Létrehozzuk a "rooms" táblát a játékállapotok tárolására
CREATE TABLE public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  status text NOT NULL,
  players jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  "gameData" jsonb
);

-- Bekapcsoljuk a Realtime funkciót, 
-- hogy a webes kliensek azonnal reagáljanak minden változásra (WebSockets)
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
```

#### 3. lépés: Biztonsági mechanikák
Bár a táblában JSONB dokumentumokként tároljuk az adatokat a legnagyobb rugalmasság érdekében (mivel frontend oldalról vezéreljük a versenyszabályokat és az időzítők adatait), a táblán be vannak kapcsolva azok a RLS (Row Level Security) házirendek, amelyek engedélyezik az Anonim hozzáféréseket az olvasásra/írásra, így a bejelentkezés nélküli parti élmény hibátlan. Ezt később szigoríthatod.

---

## 🔥 Kiemelt Funkciók & Érdekességek
- 🤖 **Óriási, okos szóadatbázis:** Közel 1250 egyedi, manuálisan kategorizált szó és 1 darab szimpla szóból álló célzott "tipp" (hint) vigyáz arra, hogy ne ismétlődjenek a feladványok.
- 🧹 **Garbage Collector a szobáknak:** A React Hookok 5 perces inaktivitás után **automatikusan kitörlik (drop)** az elhagyatott szobákat a Supabase adatbázisból, megakadályozva a memóriaszivárgást és a szerver elszemetelődését.
- 🎨 **Prémium Dizájn (UI/UX):** "Glassmorphismus" kártyák, 3D animált, csúsztatott versenydobogó, pulzáló betöltőképernyő és elegáns, áttekinthető színpaletták tartják tiszteletben az asztali partijátékok stílusát, mentesítve a képernyőt a felesleges "robosztus" gomboktól.
