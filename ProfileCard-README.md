# ProfileCard HTML/CSS/JS Komponenta

Shadcn-inspirovaná ProfileCard komponenta s tilt efektem, animacemi a různými stavy.

## 🚀 Funkce

- **Tilt efekt** - 3D rotace při najetí myší
- **Různé stavy** - Online, Away, Offline
- **Responzivní design** - Funguje na všech zařízeních
- **Animace** - Plynulé přechody a hover efekty
- **Konfigurovatelné** - Různé možnosti nastavení
- **TypeScript ready** - Připraveno pro TypeScript

## 📁 Soubory

- `profile-card.html` - Základní ukázka s ovládáním
- `profile-card-demo.html` - Různé varianty komponenty
- `profile-card.css` - Kompletní styly
- `profile-card.js` - JavaScript funkcionalita

## 🎨 Použití

### Základní HTML struktura

```html
<div class="profile-card" id="profileCard">
    <div class="profile-card__background"></div>
    <div class="profile-card__content">
        <div class="profile-card__header">
            <div class="profile-card__avatar">
                <div class="profile-card__avatar-image">S</div>
                <div class="profile-card__status" data-status="online"></div>
            </div>
            <div class="profile-card__user-info">
                <h3 class="profile-card__name">Stefan Kyzek</h3>
                <p class="profile-card__title">Web Developer</p>
                <p class="profile-card__handle">@stefankyzek</p>
            </div>
        </div>
        <div class="profile-card__status-info">
            <div class="profile-card__status-dot"></div>
            <span class="profile-card__status-text">Online</span>
        </div>
        <button class="profile-card__contact-btn">
            <svg>...</svg>
            Kontaktovat
        </button>
        <div class="profile-card__info">
            <div class="profile-card__info-row">
                <span class="profile-card__info-label">Dostupnost</span>
                <span class="profile-card__info-value profile-card__info-value--online">Dostupný</span>
            </div>
            <div class="profile-card__info-row">
                <span class="profile-card__info-label">Odezva</span>
                <span class="profile-card__info-value">< 1 hodina</span>
            </div>
        </div>
    </div>
</div>
```

### JavaScript inicializace

```javascript
// Základní použití
const profileCard = new ProfileCard(document.getElementById('profileCard'));

// S konfigurací
const profileCard = new ProfileCard(document.getElementById('profileCard'), {
    enableTilt: true,
    enableMobileTilt: false,
    tiltIntensity: 10
});
```

## ⚙️ Konfigurace

### Možnosti

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableTilt` | boolean | `true` | Povolit tilt efekt |
| `enableMobileTilt` | boolean | `false` | Povolit tilt na mobilu |
| `tiltIntensity` | number | `10` | Intenzita tilt efektu |

### Metody

```javascript
// Změnit status
profileCard.setStatus('away'); // 'online', 'away', 'offline'

// Přepnout tilt efekt
profileCard.toggleTilt();

// Přepnout zobrazení user info
profileCard.toggleUserInfo();

// Získat aktuální stav
const status = profileCard.getStatus();
const isTiltEnabled = profileCard.isTiltEnabled();
const isUserInfoVisible = profileCard.isUserInfoVisible();
```

## 🎨 CSS třídy

### Základní třídy

- `.profile-card` - Hlavní kontejner
- `.profile-card__background` - Pozadí s gradientem
- `.profile-card__content` - Obsah karty
- `.profile-card__header` - Hlavička s avatarem
- `.profile-card__avatar` - Avatar kontejner
- `.profile-card__avatar-image` - Avatar obrázek/písmeno
- `.profile-card__status` - Status indikátor
- `.profile-card__user-info` - Uživatelské informace
- `.profile-card__status-info` - Status informace
- `.profile-card__contact-btn` - Kontaktní tlačítko
- `.profile-card__info` - Dodatečné informace

### Modifikátory

- `.profile-card--status-online` - Online status
- `.profile-card--status-away` - Away status
- `.profile-card--status-offline` - Offline status
- `.profile-card--user-info-hidden` - Skryté user info
- `.profile-card--tilt-disabled` - Vypnutý tilt efekt

## 🎯 Stavy

### Online
- Zelený status indikátor
- Pulzující animace
- "Dostupný" text
- "< 1 hodina" odezva

### Away
- Žlutý status indikátor
- Bez animace
- "Nedostupný" text
- "1-2 hodiny" odezva

### Offline
- Šedý status indikátor
- Bez animace
- "Nedostupný" text
- "1-2 dny" odezva

## 📱 Responzivní design

- **Desktop**: Plná funkcionalita s tilt efekty
- **Tablet**: Optimalizované rozložení
- **Mobile**: Zjednodušené animace pro lepší výkon

## 🎨 Customizace

### CSS proměnné

```css
:root {
  --accent: #46bde5;
  --accent-600: #3897ca;
  --accent-700: #246aa7;
  --bg: #0b0c0f;
  --panel: #111319;
  --text: #e7e9ee;
  --muted: #a9afbd;
  --border: #232633;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --radius: 14px;
  --radius-lg: 22px;
}
```

### Přizpůsobení barev

```css
.profile-card {
  --accent: #your-color;
  --success: #your-success-color;
  --warning: #your-warning-color;
}
```

## 🔧 Pokročilé použití

### Vlastní event handlery

```javascript
const profileCard = new ProfileCard(element, {
  onContactClick: () => {
    console.log('Custom contact handler');
    // Vlastní logika
  }
});
```

### Dynamické změny

```javascript
// Změnit jméno
const nameElement = profileCard.element.querySelector('.profile-card__name');
nameElement.textContent = 'Nové jméno';

// Změnit avatar
const avatarElement = profileCard.element.querySelector('.profile-card__avatar-image');
avatarElement.textContent = 'N';
```

## 🐛 Troubleshooting

### Tilt efekt nefunguje
- Zkontrolujte, zda je `enableTilt: true`
- Ověřte, že element má `position: relative`

### Animace nejsou plynulé
- Zkontrolujte `transform-style: preserve-3d`
- Ověřte `perspective` hodnotu

### Responzivní problémy
- Zkontrolujte `@media` queries
- Ověřte `flex` a `grid` vlastnosti

## 📄 Licence

MIT License - volně použitelné pro komerční i nekomerční účely.

## 🤝 Přispívání

1. Fork projektu
2. Vytvořte feature branch
3. Commit změny
4. Push do branch
5. Otevřete Pull Request
