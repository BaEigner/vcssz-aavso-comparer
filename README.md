# AAVSO - VCSSZ Összehasonlító

This tool is for Hungarian visual variable star observers so rest of the page (and the tool itself) will be in Hungarian. It compares data from the VCSSZ database (Hungarian variable star observer group of the Hungarian Astronomical Association (MCSE)) and the AAVSO database and generates difference lists downloadable in AAVSO visual format. 

Ez a webes eszköz a VCSSZ és az AAVSO adatbázisának összehasonlítására készült, csak vizuális észlelésekre fókuszálva. A differenciák alapján listákat generál, amik letölthető AAVSO vizuális formátumában, file-ként.

Az oldal [itt](https://baeigner.github.io/vcssz-aavso-comparer/) érhető el. 

## Használata
1. Észlelési listák letöltése. A nyitóldalon, a két megjelenő blokkban, a file kiválasztó alatt elérhető link mindkét oldal ezen funkciójához. 
2. Az észlelési listák betöltése: mindkettő file választó csak a megfelelő formátumú file-t engedi kiválasztani (VCSSZ esetében .aavso, AAVSO esetén .txt). Megnyitás után ezeket feldolgozza a rendszer, a fejlécben jelzi is az észlelések számát.
3. Ha mindkét lista betöltődött, a megjelenő "Listák összehasonlítása" gombra kattintva elindítható az összehasonlítás.
    - Az összehasonlítás alapja a csillag neve, illetve az észlelés dátuma JD-ben, maximum 4 tizedesig figyelembe véve
    - Az AAVSO listájában szereplő csillagok nevéből a szóközök eltávolításra kerülnek, mivel a VCSSZ-nél pl. a N Her 2021 formátumú elnevezések anélkül tárolódnak (tehát pl. NHer2021), így az összehasonlításhoz ez szükséges
5. A feldolgozás után 4 táblázat keletkezik (illetve a korábbi felületi elemek eltűnnek):
    - a tetején 1-1 táblázat a feldolgozott észlelésekkel
    - ezen táblázatok utolsó előtti oszlopa mutatja, hogy megtalálható-e az észlelés a másik listában (true/false értékekkel szűrhető a fejlécben)
    - szintén ezeknél, az utolsó oszlopban lévő "+" gombbal hozzáadható egy lista az alsó, exportálandó listát tartalmazó táblázatokhoz
    - az alján 1-1 táblázat a differenciákkal, melyek kezdetben azokat az észleléseket listázzák, amik a másik adatbázis listájában nem talált a rendszer 
    - ezeknél az utolsó oszlopban szereplő "x" segítségével eltávolítható egy észlelés
6. Amennyiben kialakult a végleges exportálandó lista, akkor a táblázat alatt található letöltés gombbal az kiexportálható AAVSO vizális formátumban. Az exportáláshoz az importált listákból kiolvasott észlelőkódot használja a rendszer.

## Megjegyzések
* Az AAVSO oldaláról letöltött lista file nevében szereplő észlelőkódot ne módosítsuk, a rendszer ebből ismeri fel automatikusan
* A rendszer nem képes a különböző neveken listázott csillagok összeegyeztetésére, pl. számára a N Cas 2021 nem egyenlő a V1405 Cas-al
* Az összehasonlításnál az eredeti AAVSO-s nevet, illetve a szóközöktől megtisztított verziót is próbálja a rendszer, mivel a VCSSZ-nél pl. a N Her 2021 formátumú elnevezések anélkül tárolódnak (tehát pl. NHer2021), így az összehasonlításhoz ez szükséges lehet
* A 4 tizedesig figyelembe vett JD dátum esetén is előfordulhat, hogy emiatt nem talál egyezést a rendszer. Ezért (is) érdemes kézzel átfésülni a találatokat, tehát pl. a bal alul listázott, AAVSO-ban nem, de VCSSZ-ben megtalált észleléseket kézzel megpróbálni megkeresni a jobb felső, AAVSO-ból betöltött táblázatban
* A jobb felső darokban szereplő Nap/Hold ikonnal váltani lehet a sötét és világos színvilág között. Érdemes az oldal használatának elején választani, mivel ha már elkészültek a táblázatok, akkor azok kinézetét, szélességét negatívan befolyásolhatja a váltás (bug - a váltásnál a táblázatok teljes képernyős szélességűre ugranak szét)
* 1400px szélességnél kisebb felbontás (vagy ablak méret) esetén a táblázatok egymás alá kerülnek, az oldal átláthatósága romlik. A fejlesztés 1920px szélességen történt, erre lett optimalizálva. 
* Az adatok nem kerülnek feltöltésre sehova, a feldolozás teljesen a böngészőben történik. 
* Az összehasonlításban lehetnek hibák, érdemes a listákat minden esetben ellenőrizni. 
* A letöltött listákat érdemes betöltés előtt ellenőrizni. Az AAVSO esetén ez automatikus, hisz a WebObs rákérdez, a VCSSZ esetén éljünk a teszt gomb nyújtotta biztonság lehetőségével.
