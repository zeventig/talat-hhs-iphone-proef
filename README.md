# Talat HHS v5.0 — iPhone publieke broncode

Dit is alleen de **broncode** voor GitHub Actions. De repo mag **geen** SQLite, notities, studentnummer, wachtwoorden, wifi-sleutels of echte schooldocumenten bevatten.

- Offline: Vandaag, taken afvinken, planning, alle negen bekende vakken, voorlopige toekomstige blokken, zoeken, studiehulp.
- Wifi: versleutelde berichten van/naar Windows, taakvoorstellen na handmatige goedkeuring.
- Optioneel: privénotities en leerdoelen alleen lezen na twee bewust gegeven toestemmingen; optionele vragen aan lokaal Ollama op Windows.
- Geen betaalde API, geen automatische Brightspace-sync, geen achtergrondproces en geen cloudaccount.

## IPA maken

Gebruik `UPDATE_GITHUB.cmd` in de bovenliggende map, start daarna GitHub Actions-workflow **Bouw Talat HHS iPhone v5.0 (unsigned)**. Download het artifact, pak uit en installeer de unsigned IPA via Sideloadly. Gebruik dezelfde bundle-ID als de werkende proefapp om je lokale iPhone-opslag zo mogelijk te behouden; verwijderen wist mogelijk lokale gegevens.

De build is pas bevestigd wanneer GitHub groen meldt; installatie is pas bevestigd na testen met echte iPhone.
