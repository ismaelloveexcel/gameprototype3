# BreezeGarden — Addictive Merge Garden Blueprint

Premium, calming, relentlessly re-playable. BreezeGarden takes the serene 5×5 floating garden fantasy and layers in just enough compulsion to keep players looping for “one more merge” without breaking the cozy vibe.

## Experience Pillars
- **Micro-satisfaction chain**: draw → place → merge → evolve delivers a reward every 8–12 seconds.
- **Endless mastery without pressure**: no timers, but high scores, tier unlocks, and cosmetic prestige keep veterans chasing perfection.
- **Hyper-tactile craft**: painterly plants, cinematic lighting, and plush UI motion make every tap feel premium.

## Core Loop
1. Deal three random plant tiles into a queue with rarity bias that favors near-complete sets.
2. Player drags any tile onto the 5×5 floating tray (undo bubble available for premium currency or ad token).
3. If placement creates a cluster of three identical tiers (orthogonal adjacency), all matching plants pulse, rise, and merge automatically.
4. Merge spawns the next tier, increases the Serenity Meter, and rains soft pollen across adjacent tiles.
5. Queue instantly refills; player may hold one tile for later to set up cascades.
6. When the board fills, score is tallied, persistent progress bars tick up, graceful restart animation plays within 3 seconds to keep momentum.

## Addictive Systems (Layered Retention)
- **Serenity Meter**: every merge fills a looped progress ring; completing it triggers a “Zen Burst” that upgrades a random tile and showers bonus particles.
- **Garden Chronicle**: codex tracks discovered tiers, best merge chains, and screenshot-worthy layouts; completing a page grants shaders or audio skins.
- **Daily Drift Seeds**: once per day a special tile enters the queue that, when merged, plants a limited-time blossom variant with unique glow to flex in screenshots.
- **Wind-Blessed Runs**: every fifth session adds a Wind Tile somewhere on the board; planning around its sway buff (+10% score) keeps veteran players optimizing.

## Visual Direction & Graphics Upgrades
### Board & UI
- Floating tray crafted from burled maple or moonstone with tessellated inlay, rounded chamfers, and a soft parallax shadow hovering over a reflective puddle.
- Engraved grid lines glow subtly as tiles hover; grid pulses with low-frequency light when a merge is possible.
- UI chips made from frosted glass with micro-texture, using dual-tone pastel accents and inset glyphs.

### Background Atmosphere
- Layered pastel gradient sky (lavender → blush peach) rendered with HDR bloom and depth-based color shift.
- Slow, spline-driven particles (petals, dust motes) using additive blending and chromatic drift; occasional volumetric god rays slip behind the board.
- Procedural cloud cards plus bokeh sprites that react to cursor/drag velocity with slight parallax.

### Plant Tier Treatment
- **T1 Sprout**: dew-speckled seedlings with subsurface scattering and subtle soil crumble on placement.
- **T2 Leaflet**: twin leaves with iridescent veins; tiny pollen jets fire while idle.
- **T3 Lavender Bush**: dense bloom clusters, soft ambient occlusion, and swaying branch physics tied to Wind Tiles.
- **T4 Mini Sakura**: translucent petals, rim lighting, and petal drift that lingers on the board.
- **T5 Detailed Bonsai**: hand-painted bark normals, braided roots, miniature lantern hanging from a branch casting dynamic shadow.
- **T6 Spirit Tree**: semi-transparent trunk with inner bioluminescent pulse, orbiting motes, and a breathing glow synced to serene audio pads.

### Merge “Candy Crush” Moment (Locked, Enhanced)
1. Identical plants squeeze inward, emit a heartbeat pulse, and lift 6–8 px with motion blur.
2. Golden pollen spirals upward, guided by spline particles with soft turbulence.
3. Plants compress into a luminous seed orb with refraction shader and caustic flicker.
4. Orb cracks via animated normal map; shards dissolve into light ribbons.
5. New tier blooms with a DOF kick, chromatic lens flare, and a ground ripple that nudges nearby tiles.

### Optional Delight Modes
- **Wind Tile** (every 10–15 moves): emits directional streaks, pushes nearby foliage into synchronized sway, leaves trails of glittering dust.
- **Firefly Night Mode** (post-game): background shifts to indigo gradient, Spirit Tree’s glow intensifies, emissive fireflies orbit the board casting soft specular hits.

## Audio & Haptics
- Placement: layered leaf-tap + muted chime with randomized pitch to avoid fatigue.
- Merge: airy bell + pollen whoosh, side-chained to dim background wind for clarity.
- Background bed: distant birds, gentle shakuhachi breaths, and low-volume wind loops mastered for office-safe volume.
- UI taps: cushioned wood clicks with tiny stereo spread. If on mobile, pair with 12 ms soft haptic taps for placements and longer 30 ms buzz for merges.

## Game Over & Meta
- When full, camera gently tilts, petals fall, and score tallies with floating digits; players can share a postcard render of their final board (auto-saved to gallery).
- Soft restart zooms the tray out, wipes it clean with a ripple, and deals the first queue while the background palette shifts slightly to keep freshness.

## Recommended Launch Site for Best Graphics
Launch a downloadable PC/Mac build on **Steam**. Steam lets you ship HDR-capable, 4K-ready builds without browser compression limits, supports high-end post-processing (bloom, SSAO, volumetrics), and instantly taps into the cozy/premium indie audience already primed for lush visuals. Pair the Steam release with an optional WebGL teaser elsewhere if desired, but host the definitive version on Steam for uncompromised graphics fidelity.

## Playable Prototype (This Repo)
To give the blueprint something tangible, this repository now ships a lightweight HTML/CSS/JS prototype that runs anywhere a modern browser is available (Replit, GitHub Pages, Netlify, etc.). Highlights:

- 5×5 floating tray with soft-engraved slots and deluxe UI shell described above.
- Queue of three tiles with rarity bias, Drift Seed variants, hold capsule, undo pulse, and move counter.
- Merge logic that resolves orthogonal clusters of three or more, supports cascading upgrades, awards serenity, and performs Zen Burst boosts once the meter loops.
- Wind Tile buff that appears every ~10–15 moves, plus Firefly Night palette toggle and animated background clouds/particles.
- Minimal state persistence (best score stored in `localStorage`) and helper hotkeys (`R` restart, `U` undo).

### Run on Replit
1. Create a new **HTML/CSS/JS Replit** or import this repo directly via Git.
2. Ensure the three files stay at the project root: `index.html`, `style.css`, and `script.js` (no build tooling required).
3. Hit the green **Run** button. Replit’s static web server will launch automatically and expose the URL where the garden prototype is playable.
4. Optional: toggle the console to view logged state snapshots while debugging (`console.log` statements are already sprinkled through the JS if you need deeper insight).

### Run Locally
```bash
npx serve
# or
python3 -m http.server 4173
```
Then open the printed localhost URL in your browser.