# Talat HHS — iPhone-proef v1.1.1

Mobiele weergave-bugfix. De proefapp bevat alleen fictieve voorbeeldtaken. Geen echte studiegegevens of Windows-sync.

## Bijwerken van je bestaande installatie
1. Pak de complete ZIP uit.
2. Dubbelklik **UPDATE_GITHUB.cmd** uit de bovenste map.
3. Geef de URL op van je **bestaande** openbare GitHub-repository `talat-hhs-iphone-proef`.
4. Open GitHub → Actions → **Bouw iPhone proef-IPA (unsigned)** → **Run workflow**.
5. Download het nieuwe artifact, pak uit en installeer de IPA via Sideloadly.

De update verandert alleen openbare voorbeeldbroncode. De iPhone-gegevens kunnen bij het opnieuw installeren behouden blijven als iOS dit als update behandelt, maar dit is niet gegarandeerd. De Windows-app en 117 notities blijven onaangeroerd.

## Test
- Tik op `Snel een VOORBEELD-taak toevoegen` en open het toetsenbord. **Geen automatische zoom**.
- Typ een lange titel, controleer dat horizontaal scrollen niet mogelijk is.
- Voeg de taak toe en controleer opslag na heropenen.
- Test zowel in portretstand als liggend, als je iPhone dat ondersteunt.

De HTML viewport ondersteunt handmatig zoomen voor toegankelijkheid. De inputtekst is 16px; de CSS-grid en tekstomloop voorkomen horizontale overloop.
