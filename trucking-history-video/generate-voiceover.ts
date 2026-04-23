/**
 * Generates ElevenLabs voiceover MP3s for each scene.
 * Run: ELEVENLABS_API_KEY=sk-... node --strip-types generate-voiceover.ts
 *
 * Optional: set ELEVENLABS_VOICE_ID to override the default voice.
 * Default voice: Adam (calm, authoritative American English narrator)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
// Adam — calm, authoritative American English. Override via env var.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";
const MODEL = "eleven_multilingual_v2";

if (!API_KEY) {
  console.error(
    "\n❌  ELEVENLABS_API_KEY is not set.\n" +
      "    Run: ELEVENLABS_API_KEY=your_key node --strip-types generate-voiceover.ts\n"
  );
  process.exit(1);
}

// ─── Narration script ────────────────────────────────────────────────────────
const SCENES = [
  {
    id: "scene1",
    label: "Hook",
    text: "Before Amazon. Before Walmart. Before GPS. Everything you own — every tool, every shirt, every bite of food — arrived on a truck. This is the story of how eighteen wheels changed civilization.",
  },
  {
    id: "scene2",
    label: "1896 – The First Truck",
    text: "In eighteen ninety-six, Gottlieb Daimler built the world's first purpose-built motor truck. Four horsepower. Ten miles per hour. Crude by any measure — but it planted the seed of an industry that would reshape the modern world. In nineteen hundred, the Mack Brothers followed, and an American icon was born.",
  },
  {
    id: "scene3",
    label: "1916–1945 – War",
    text: "World War One changed everything. The military needed to move massive cargo across brutal terrain — and trucks delivered. By World War Two, American factories had produced nearly three million military trucks. When the soldiers came home, they brought the open road with them.",
  },
  {
    id: "scene4",
    label: "1956 – The Interstate",
    text: "In nineteen fifty-six, President Eisenhower signed the Federal-Aid Highway Act — creating forty-one thousand miles of interstate highway. Overnight, a driver could cross the entire country without hitting a single stoplight. Trucking revenue doubled within a decade. America had found its backbone.",
  },
  {
    id: "scene5",
    label: "1970s–80s – Golden Age",
    text: "The nineteen seventies and eighties were the golden age of trucking. CB radios crackled coast to coast. Smokey and the Bandit made truckers folk heroes. When deregulation hit in nineteen eighty, it unleashed a wave of competition — more trucks, more routes, more freedom on the open road.",
  },
  {
    id: "scene6",
    label: "Today – The Stats",
    text: "Today, three-point-five million professional drivers keep America moving. Seventy percent of all freight moves by truck. The industry is worth nine hundred and forty billion dollars — and growing. Without truckers, store shelves go empty in just four days.",
  },
  {
    id: "scene7",
    label: "CTA",
    text: "This is just the beginning. Every era. Every legend. Every mile. The full story of trucking is one of grit, innovation, and the American spirit. Follow now — Episode Two drops Friday.",
  },
];

const OUT_DIR = join(process.cwd(), "public", "voiceover");

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

async function generate(scene: (typeof SCENES)[number]) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scene.text,
        model_id: MODEL,
        voice_settings: {
          stability: 0.58,       // measured, consistent delivery
          similarity_boost: 0.80, // stays true to the voice
          style: 0.22,            // slight documentary gravitas, not theatrical
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${scene.id}] ElevenLabs error ${res.status}: ${body}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = join(OUT_DIR, `${scene.id}.mp3`);
  writeFileSync(outPath, buf);

  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  ✅  ${scene.id}.mp3  —  ${kb} KB`);
}

async function main() {
  console.log(`\n🚛  History of Trucking — ElevenLabs Voiceover Generator`);
  console.log(`    Voice ID : ${VOICE_ID}`);
  console.log(`    Model    : ${MODEL}`);
  console.log(`    Output   : public/voiceover/\n`);

  for (const scene of SCENES) {
    console.log(`🎙️   [${scene.id}] ${scene.label}`);
    await generate(scene);
    await new Promise((r) => setTimeout(r, 600)); // avoid rate-limit
  }

  console.log("\n✨  All 7 voiceovers generated.");
  console.log("    Next: npx remotion studio\n");
}

main().catch((err) => {
  console.error("\n❌  " + err.message);
  process.exit(1);
});
