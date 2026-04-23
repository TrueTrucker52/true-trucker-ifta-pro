# TrueTrucker — History of Trucking Video Series
## Project Memory for Claude Code Sessions

---

## What This Project Is

A YouTube Shorts / Facebook Reels video series called **"History of Trucking"** built with **Remotion 4.0.451** (React-based programmatic video). Episode 1 is a 60-second hook video. The series will run 6+ episodes covering the full history of trucking in America.

**Repo:** `TrueTrucker52/true-trucker-ifta-pro`
**Branch:** `claude/add-remotion-skills-EE7WS`
**Working directory:** `trucking-history-video/`

---

## Video Specs

| Setting | Value |
|---------|-------|
| Resolution | 1080 × 1920 (9:16 portrait) |
| FPS | 30 |
| Duration | ~60 seconds (auto-extends per voiceover length) |
| Format | MP4 via `npm run render` |
| Composition ID | `TruckingHistory-Ep1` |

---

## Brand Identity

| Token | Value |
|-------|-------|
| Primary blue | `#0066CC` |
| Light blue | `#3399FF` |
| Dark blue | `#004499` |
| Gold | `#F5A623` |
| Gold light | `#FFD166` |
| Rust | `#C73B0A` |
| White | `#F5F0EB` |
| White muted | `#B8C5D0` |

- **Logo:** `public/logo.png` (64×64 in brand bar, 96×96 in CTA scene)
- **Heading font:** Oswald 700 (via `@remotion/google-fonts`)
- **Body font:** Inter 400/600 (via `@remotion/google-fonts`)
- **Brand bar:** appears on every scene — logo top-left, "EP. X" pill top-right, series label bottom-center, blue gradient line at very bottom

---

## AI Voiceover — ElevenLabs

| Setting | Value |
|---------|-------|
| Model | `eleven_multilingual_v2` |
| Voice | Adam — `pNInz6obpgDQGcFmaJgB` |
| Stability | 0.58 |
| Similarity boost | 0.80 |
| Style | 0.22 |
| Speaker boost | true |
| Output | `public/voiceover/scene1.mp3` … `scene7.mp3` |

**API Key:** `sk_005a0d0d111fbdd0fead0bbedd84e42c06a10ad1fd594005`

**Generate voiceovers:**
```powershell
$env:ELEVENLABS_API_KEY="sk_005a0d0d111fbdd0fead0bbedd84e42c06a10ad1fd594005"
npx tsx generate-voiceover.ts
```

**Important:** Must be run locally on Windows — the cloud server has no outbound internet access.

---

## Stock Photos

Photos live in `public/photos/scene1.jpg` through `scene7.jpg`.

| Scene | Subject | Source |
|-------|---------|--------|
| scene1 | Semi truck at night | Pexels |
| scene2 | 1896 Daimler Motor-Lastwagen | Wikimedia Commons (public domain) |
| scene3 | WWII Red Ball Express convoy | Wikimedia Commons (public domain) |
| scene4 | Aerial highway interchange | Pexels |
| scene5 | Classic Peterbilt / show truck | Pexels |
| scene6 | Modern semi on open highway | Pexels |
| scene7 | Truck at golden-hour sunset | Pexels |

**Download real photos (run once on Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File download-photos.ps1
```

---

## Scene Structure — Episode 1

| # | Component | Duration | Content |
|---|-----------|----------|---------|
| 1 | `Scene1Hook` | ~7s | "Before Amazon. Before Walmart. Before GPS." hook |
| 2 | `Scene2FirstTruck` | ~10s | 1896 Daimler — the first motor truck |
| 3 | `Scene3Wars` | ~9s | WWI & WWII built the industry |
| 4 | `Scene4Interstate` | ~10s | 1956 Eisenhower Highway Act |
| 5 | `Scene5GoldenAge` | ~9s | 1970s–80s golden age, CB radios, deregulation |
| 6 | `Scene6Today` | ~8s | Today: 3.5M drivers, 70% of US freight, $940B |
| 7 | `Scene7CTA` | ~10s | CTA — "Follow Now", Episode 2 drops Friday |

Transitions: slide-from-right between scenes 1–5, fade between 5–6 and 6–7. Each transition = 15 frames overlap.

Scene durations are **dynamic** — `calculateMetadata` reads actual MP3 file lengths via mediabunny and sets each scene's frame count to `ceil(seconds × 30) + 12` (12-frame tail buffer).

---

## Key Files

```
trucking-history-video/
├── src/
│   ├── Root.tsx                    # Composition registration + calculateMetadata wiring
│   ├── TruckingHistory.tsx         # Main component, TransitionSeries, scene routing
│   ├── calculateMetadata.ts        # Reads MP3 durations, sets total frames dynamically
│   ├── get-audio-duration.ts       # mediabunny wrapper
│   ├── colors.ts                   # All brand + scene color tokens (C.brand, C.gold, etc.)
│   ├── fonts.ts                    # Oswald + Inter via @remotion/google-fonts
│   ├── utils.ts                    # fadeIn, slideUp, expandW, stamp, countUp helpers
│   ├── components/
│   │   ├── BrandBar.tsx            # TrueTrucker logo bar (top) + series label (bottom)
│   │   ├── SceneBase.tsx           # AbsoluteFill wrapper + BrandBar overlay
│   │   └── ScenePhoto.tsx          # Full-bleed photo + Ken Burns + gradient overlay
│   └── scenes/
│       ├── Scene1Hook.tsx
│       ├── Scene2FirstTruck.tsx
│       ├── Scene3Wars.tsx
│       ├── Scene4Interstate.tsx
│       ├── Scene5GoldenAge.tsx
│       ├── Scene6Today.tsx
│       └── Scene7CTA.tsx
├── public/
│   ├── logo.png                    # TrueTrucker app icon (copied from main app)
│   ├── logo-text.png               # TrueTrucker logo with text
│   ├── photos/                     # scene1.jpg … scene7.jpg
│   └── voiceover/                  # scene1.mp3 … scene7.mp3 (generated locally)
├── generate-voiceover.ts           # ElevenLabs script — generates all 7 MP3s
├── download-photos.ps1             # PowerShell — downloads Pexels/Wikimedia photos
└── CLAUDE.md                       # ← this file
```

---

## NPM Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `npm run studio` | `remotion studio` | Open Remotion Studio preview (localhost:3000) |
| `npm run render` | `remotion render TruckingHistory-Ep1 out/ep1.mp4` | Render final MP4 |
| `npm run voiceover` | `npx tsx generate-voiceover.ts` | Generate all ElevenLabs MP3s |
| `npm run preview` | voiceover + studio | Generate audio then open Studio |

---

## Full Local Workflow (Windows)

```powershell
cd C:\Users\fives\true-trucker-ifta-pro\trucking-history-video

# 1. Pull latest changes
git pull origin claude/add-remotion-skills-EE7WS

# 2. Install deps (first time only)
npm install

# 3. Download stock photos (first time only)
powershell -ExecutionPolicy Bypass -File download-photos.ps1

# 4. Generate voiceover (needs ElevenLabs key)
$env:ELEVENLABS_API_KEY="sk_005a0d0d111fbdd0fead0bbedd84e42c06a10ad1fd594005"
npx tsx generate-voiceover.ts

# 5. Preview in browser
npm run studio
# → opens http://localhost:3000

# 6. Render final video
npm run render
# → outputs to out/ep1.mp4
```

---

## Upload Schedule

Best time to publish YouTube Shorts for this audience (truckers, fleet owners):
- **Day:** Tuesday or Wednesday
- **Time:** 3 PM CST
- **Cadence:** Weekly, same day/time every week to train the algorithm

---

## Episode Roadmap (Series Plan)

| Episode | Topic | Status |
|---------|-------|--------|
| EP. 1 | Hook — full history overview (60s) | ✅ Built |
| EP. 2 | The First Truck — 1896 deep dive | 🔲 Not built |
| EP. 3 | WWI & WWII — how war built trucking | 🔲 Not built |
| EP. 4 | The Interstate Highway Act — 1956 | 🔲 Not built |
| EP. 5 | The Golden Age — CB radios, Smokey & the Bandit | 🔲 Not built |
| EP. 6 | Modern Trucking & IFTA — where it's heading | 🔲 Not built |

Each future episode follows the same pattern:
- New `src/scenes/` files
- New voiceover script in `generate-voiceover.ts`
- New photos in `public/photos/`
- New composition in `Root.tsx`
- Same brand bar, same fonts, same color tokens

---

## Known Constraints

- **Cloud server has no internet access** — ElevenLabs calls and photo downloads must run locally on Windows
- **Remotion Studio runs on localhost:3000** — must be started locally, not from the cloud container
- **`<Img>` not `<img>`** — always use Remotion's `Img` component for photos/logos or they won't render in the final export
- **mediabunny** reads audio duration at render time; if MP3s are missing, falls back to static default durations defined in `Root.tsx`
