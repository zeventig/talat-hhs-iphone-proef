# Talat HHS — iPhone-proef v1.1

**Dit is uitsluitend een bouw- en installatieproef.** Het bevat fictieve voorbeeldtaken en geen persoonlijke Notion-, Obsidian-, Brightspace- of SQLite-data. De echte Windows-app v1.0 blijft lokaal en ongewijzigd.

Deze repo mag **openbaar** zijn zodat standaard GitHub Actions macOS-runners kosteloos kunnen werken. Upload GEEN eigen documenten, exportbestanden, wachtwoorden of een Windows-projectmap naar deze repository.

## Bouwstappen
1. Maak een **lege openbare GitHub-repository** `talat-hhs-iphone-proef`. Geen README, .gitignore of licentie vooraf laten aanmaken.
2. Pak het ZIP uit en open de map `iphone-proef-github`.
3. Dubbelklik op `UPLOAD_NAAR_GITHUB.cmd`. Plak de URL van je lege GitHub-repository als erom wordt gevraagd. GitHub kan om een browseraanmelding vragen.
4. Open de repository op GitHub → tab **Actions** → **Bouw iPhone proef-IPA (unsigned)** → **Run workflow** → **Run workflow**.
5. Als de run slaagt, open de run onder **Artifacts** en download `Talat-HHS-iPhone-Proef-IPA`. Pak het artifact-ZIP uit: daarin staat `Talat-HHS-iPhone-Proef-UNSIGNED.ipa`.
6. Installeer de IPA via Sideloadly op Windows met een gratis Apple-account. Sideloadly ondertekent deze proefapp. Controleer of de app start en of voorbeeldtaken reageren en lokaal bewaard blijven.

**Als de workflow faalt:** kopieer de eerste echte foutregel van de rode stap. Nog niet zelf van alles aanpassen; bespreek de fout eerst met ChatGPT.

## Techniek
- Capacitor 8, minimale ondersteuning iOS 15 (afhankelijk van daadwerkelijke Xcode-installatie en iPhone).
- Xcode op een GitHub Actions `macos-26` standaardrunner.
- `CODE_SIGNING_ALLOWED=NO`, zodat een ongetekend pakket ontstaat; Sideloadly doet de ondertekening.
- De output is geen App Store-build en de iOS-compile/installatie is nog niet in deze omgeving geverifieerd.

## Privacy
De broncode is publiek toegankelijk als je een openbare repo maakt. Deze proefapp bevat uitsluitend generieke vaknamen en voorbeeldtaken. Gebruik voor de latere volledige app een aparte privacyvriendelijke oplossing, zonder openlijk gepubliceerde schoolgegevens.
