# Gobble Dash — Turkey's Great Escape

[![Turkey Run Game](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://make.fun/badge/turkey-run-game-01/Djebrix/turkey-run/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://make.fun/badge/turkey-run-game-01/Djebrix/turkey-run/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

Thanksgiving is coming and Farmer Bram has already lit the oven. You are
Gobbler, a turkey with somewhere better to be. Sprint through the farmyard,
duck into the barn, dodge the carving knives in the kitchen, and slip out of
the farm gate — 1,200 metres to freedom.

## How to play

- **Move** — ← → or A / D, or steer with the mouse
- **Jump** — Space, W, ↑, or click
- **Hide** — ↓ or S beside a haystack (the farmer searches the hay while you hide)
- **Goal** — reach 1,200 m to escape. Grab corn (+10) and pumpkins (+25);
  a knife that only just misses you pays a +20 near-miss bonus.
- **Lives** — 3. The farmer, the oven and the carving knife each cost one.

The farmer chases, searches the haystacks when you hide, and corners you if
you dawdle near the right edge. He gets faster in every stage, and the knives
fall faster too. Press Enter or click to start, and again to run again. M
mutes the synthesized WebAudio sound (gobbles, boings, dings — no audio files).

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Static files only — no build step, no network request, plays offline in
desktop Chrome. Screenshots are real renders of the game (`?shot=title`,
`?shot=play`, `?shot=kitchen`, `?shot=end` stage each screen).
