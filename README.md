# Talat HHS iPhone v4.0 — publieke broncode

Alle bestanden hier zijn demo/code en mogen in de **reeds bestaande publieke proefrepo** `talat-hhs-iphone-proef`. Er staat **geen persoonlijke SQLite, schooldocument, Apple-account of sessiesleutel** in deze repo.

Deze versie behoudt de offline lokale taakopslag van v3.0 en voegt toe:

- **Vandaag:** taken per vak filteren, op bekende deadline sorteren, één tik afvinken.
- **Vakken:** een vak openen en zijn taken zien.
- **Planning:** taken met een bekende deadline binnen zeven dagen en bestaande toetsafspraken.
- **Zoeken:** offline zoeken naar taken, vakken en afspraken (niet naar volledige notities).
- **Sync:** AES-128-GCM versleutelde gegevensuitwisseling met Windows v4.0. Tijdelijke sessiesleutel wordt niet opgeslagen. Mobiele wijzigingen moeten nog worden goedgekeurd op Windows.

Na iedere Windows-brugstart krijg je een **nieuwe 32-tekens sessiesleutel**. Voer deze opnieuw in op de iPhone. Je telefoon mag niet op openbare wifi verbonden zijn.

**Beperkingen:** berichten zijn versleuteld, maar HTTP-metadata en lokaal opgeslagen gegevens niet. Geen automatische achtergrond-sync, pushmeldingen, cloud, AI-chat of volledige notities op iPhone. Een losse snel toegevoegde iPhone-taak synchroniseert nog niet naar Windows.

Compileer via de bestaande GitHub Actions-workflow, download de unsigned IPA en installeer die met Sideloadly; dit moet op jouw apparaat worden getest. De bestaande app bijwerken zonder te verwijderen is de bedoeling, maar iOS-appopslagbehoud is niet gegarandeerd. Leg belangrijke lokale taakgegevens daarom vooraf apart vast.
