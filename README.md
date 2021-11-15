# AAVSO - VCSSZ Összehasonlító

This tool is for Hungarian visual variable star observers so rest of the page (and the tool itself) will be in Hungarian. It compares data from the VCSSZ database (Hungarian variable star observer group of the Hungarian Astronomical Association (MCSE)) and the AAVSO database and generates difference lists downloadable in AAVSO visual format. 

Ez a webes eszköz a VCSSZ és az AAVSO adatbázisának összehasonlítására készült, csak a vizuális észlelésekre fókuszálva. A differenciák alapján listákat generál, amik letölthetők [AAVSO vizuális formátumában](https://www.aavso.org/aavso-visual-file-format), file-ként.

Az oldal [itt](https://baeigner.github.io/vcssz-aavso-comparer/) érhető el. 


## Használata
1. Észlelési listák letöltése a VCSSZ és AAVSO adatbázisaiból. A nyitóldalon, a két megjelenő blokkban, a file kiválasztó alatt elérhető link mindkét oldal ezen funkciójához. 
2. Az észlelési listák betöltése: mindkettő file választó csak a megfelelő formátumú file-t engedi kiválasztani (VCSSZ esetében .aavso, AAVSO esetén .txt).     
    - Megnyitás után a rendszer először JD, majd azon belül a csillag neve alapján sorrendbe rendezi a rendszer
    - Feldolgozás után a fejlécben jelzi a betöltött észlelések számát, illetve AAVSO esetén a talált duplikációk számosságát is, ha volt ilyen
3. Ha mindkét lista betöltődött, megjelenik a JD tolerancia beállítási lehetőség és az összehasonlítás elindítására szolgáló gomb:
    - Az összehasonlítás alapja a csillag neve, illetve az észlelés dátuma JD-ben
    - JD összehasonlítás a megadott tolerancia értékkel történik. Alapértelmezetten ez 0.001 JD, tehát maximum ekkora eltérésnél még egyezőnek számít. Az összehasonlítás előtt 0-ra állítva pontos egyezés esetén jelez csak találatot.
    - A JD-ben vett dátumokat maximum a negyedik tizedesig veszi figyelembe, megjelenítve is így lesznek (a később exportban a bemenő adatokban szereplő, teljes hosszúságú dátum szerepel)
4. A feldolgozás után 4 táblázat keletkezik (illetve a korábbi felületi elemek eltűnnek):
    - a tetején 1-1 táblázat a feldolgozott észlelésekkel
    - ezen táblázatok utolsó előtti oszlopa mutatja, hogy megtalálható-e az észlelés a másik listában (true/false értékekkel szűrhető a fejlécben)
    - szintén ezeknél, az utolsó oszlopban lévő "+" gombbal hozzáadható egy észlelés az alsó, exportálandó listát tartalmazó táblázatokhoz
    - az AAVSO-s észleléseket listázó táblázatban a duplikált észlelések narancssárga háttérrel jelennek meg
    - az alján 1-1 táblázat a differenciákkal, melyek kezdetben azokat az észleléseket listázzák, amik a másik adatbázis listájában nem talált a rendszer 
    - ezeknél az utolsó oszlopban szereplő "x" segítségével eltávolítható egy észlelés
    - az AAVSO-ból VCSSZ-nek exportálandó lista alatt, ha volt ilyen, akkor a duplikált észlelések sorszámait felsorolja a rendszer
5. Amennyiben kialakult a végleges exportálandó lista, akkor a táblázat alatt található letöltés gombbal az kiexportálható AAVSO vizális formátumban. Az exportáláshoz az importált listákból kiolvasott észlelőkódot használja a rendszer.

## Megjegyzések
* Az AAVSO oldaláról letöltött lista file nevében szereplő észlelőkódot ne módosítsuk, a rendszer ebből ismeri fel automatikusan
* A rendszer nem képes a különböző neveken listázott csillagok összeegyeztetésére, pl. számára a N Cas 2021 nem egyenlő a V1405 Cas-al
* Az összehasonlításnál az eredeti AAVSO-s nevet, illetve a szóközöktől megtisztított verziót is próbálja a rendszer, mivel a VCSSZ-nél pl. a N Her 2021 formátumú elnevezések anélkül tárolódnak (tehát pl. NHer2021), így az összehasonlításhoz ez szükséges lehet
* Amennyiben nem talál egyezért a rendszer, érdemes kézzel átfésülni a találatokat, tehát pl. a bal alul listázott, AAVSO-ban nem, de VCSSZ-ben megtalált észleléseket kézzel megpróbálni megkeresni a jobb felső, AAVSO-ból betöltött táblázatban (pl. pontos JD alapján)
* A jobb felső sarokban szereplő Nap/Hold ikonnal váltani lehet a sötét és világos színvilág között. 
* 1400px szélességnél kisebb felbontás (vagy ablak méret) esetén a táblázatok egymás alá kerülnek, az oldal átláthatósága romlik. A fejlesztés 1920px szélességen történt, erre lett optimalizálva. Mobilra nincs optimalizálva egyáltalán.
* A megyjegyzés kód mezőnél, ha ki van töltve, akkor az egeret fölé víve megjelenik annak az "emberi" változata
* Az adatok nem kerülnek feltöltésre sehova, a feldolozás teljesen a böngészőben történik. 
* Az összehasonlításban lehetnek hibák, érdemes a listákat minden esetben ellenőrizni. 
* A letöltött listákat érdemes betöltés előtt ellenőrizni. Az AAVSO esetén ez automatikus, hisz a WebObs rákérdez, a VCSSZ esetén éljünk a teszt gomb nyújtotta biztonság lehetőségével.
* A rendszerből hiányzik sok olyan eset kezelése, amik ritkán, leginkább hibás esetekben fordulhatnak elő, pl. betöltendő észlelési lista egyik sorában kevesebb oszlop adata szerepel, mint a többiben; hiányzik az észlelőkód az AAVSO-s betöltendő file-ból, stb. Olyan probléma, ami a normál működést akadályozza, az jelezhető itt a GitHub-on, az issues funkciónál, vagy közvetlenül a fejlesztőnél: [e-mail írása](mailto:eigner.balazs@gmail.com?subject=[GitHub]%20AAVSO%20VCSSZ%20Összehasonlító).
