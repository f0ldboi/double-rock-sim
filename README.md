# Double Rock Sim

Practice Doom delve 8+ double rocks.

**Play it at https://double-rock-sim.pages.dev**

![The sim mid-barrage: debris shadows around the player, Protect from Magic up, prayer book on the right](site/preview.png)

A browser practice tool for the double rock (also called double boulder) at the Doom of Mokhaiotl in Old School RuneScape. On delve 8 and deeper, Doom throws two rocks three ticks apart. Dodge both boulders and both debris showers, then pray against the six-hit barrage. A rep with no damage is clean.

It has two modes, picked in the top row:

- **Double rock**: dodge the rocks and pray the barrage.
- **Rockblock + punish**: the OSRS Wiki's Double Rockblock with a melee punish. Put each boulder on its marked tile, then interrupt Doom's melee charge with a crystal halberd special. See [Rockblock + punish](#rockblock--punish).

## Controls

| Action | Input |
| --- | --- |
| Run | Click |
| Walk | Ctrl + Click |
| Pray | Click a prayer in the prayer book |
| Attack Doom (Rockblock + punish) | Click Doom |
| Special attack (Rockblock + punish) | Click the special attack orb above the prayer book |
| Pause | Space |
| Next tick (while paused) | `.` |

You always run, as you would at Doom. Both modes start you south of Doom, below it on screen, where most players keep their character.

## Features

- The prayer book uses the in-game layout. As in the game's prayer interface, each prayer is a 34x34 box on a 37 px grid: a click anywhere in the box counts, and the gaps between boxes do nothing. The icons are drawn a little larger than the game's. **Arrange prayers** moves the three protection prayers to any slot to match your own book.
- Real hitpoints mode ends the run at 0 HP. Practice mode keeps you on 1 HP and tells you when a hit would have killed you.
- The Last rep report shows how you exited each rock, what landed on you and each barrage hit. Session stats track clean reps, your streak, and damage taken and times hit from debris, boulders and the barrage.
- The game's own sound effects, played on the same ticks as in game, so you can learn the double rock by ear. See [Sound cues](#sound-cues).
- A tick ruler, a tick log, pausing and single-tick stepping.
- Tile indicators like RuneLite's plugin: your destination tile, the hovered tile and your true tile, each with its own highlight colour, fill colour and border width. Colours are RuneLite's #AARRGGBB. They default to one player's own RuneLite settings, and Settings can change or reset them.
- Sound on or off and the volume sit at the right end of the control row under the game view.
- The bottom of the page has a short Strategy section with steps for both modes.
- Tile markers, hints, camera and zoom are in Settings. Settings and stats are saved in your browser.

## Timings

Times are in game ticks of 0.6 s. T is the tick Doom throws rock 1.

| Tick | What happens |
| --- | --- |
| T−2 | Doom starts the throw animation for rock 1: it rears up and lets go with a whoosh 0.76 s in, and the rock is in the air 2 ticks later, as in game |
| T | Rock 1 is thrown |
| T+1 | Doom starts the throw animation for rock 2 |
| T+3 | Rock 2 is thrown |
| T+6 | Rock 1 dips |
| T+7 | Rock 1 bursts. Your overhead prayer turns off, a boulder is aimed at the tile you're on, and debris shadows appear in the 9x9 around you |
| T+9 | Rock 1's boulder and debris land. Rock 2 dips |
| T+10 | Rock 2 bursts |
| T+11 to T+16 | The barrage: six hits in the order X Y X X Y X, where X is the rock's style (blue rock: Magic, green rock: Ranged) |
| T+12 | Rock 2's boulder and debris land |

A boulder that lands on you pushes you to a random tile next to it and stays on the floor. Rock 2's debris never lands on rock 1's debris tiles. On each tick the sim handles your clicks first, then Doom and the falling rocks, then your movement.

Prayer clicks work as in the game. Your prayer book lights up the moment you click, however fast you click, and the prayer itself (your overhead, and what a hit checks) changes on the next tick, when every click since the last tick is processed in order. So only where your clicks end up before a tick counts. Doom's barrage projectiles check your prayer when they reach you, as the Leviathan's do, so a switch clicked during the tick before a hit lands still blocks it. A prayer clicked before rock 2 bursts is switched off by the burst, which is why you pray after it.

These timings come from the [OSRS Wiki](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl) and a frame-by-frame count of the wiki's delve 8 clip. Some values are estimates: about 18 debris tiles per rock, the damage rolls (15 to 21 per rock, 15 to 65 per unprayed barrage hit) and the 2-tick stun after a boulder push.

## Rockblock + punish

You hold a crystal halberd in this mode. It drills the OSRS Wiki's [Double Rockblock](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl/Strategies#Double_Rockblock) from the south side, together with the [melee punish](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl/Strategies#Melee_punish) of Doom's melee charge. Every rep starts on tile 1, and you go back there before the next one.

1. Stand on tile 1, the green tile 10 tiles south of Doom's centre.
2. When rock 1 dips (T+6), click tile 2, 5 tiles east. Boulder 1 lands on tile 1.
3. When rock 2 dips (T+9), turn on the special attack and click Doom. Boulder 2 lands on tile 2, and you run to the halberd's reach, 2 tiles from Doom, and hit.
4. Pray the barrage as usual on the way.

On rock 2's throw (T+3), Doom prays against magic and ranged, and a yellow charge bar fills over its head, drawn bigger than in game. Only a melee hit stops the charge. The 5x5 tiles Doom stands on are tinted, and a click on them attacks it. Running in after dip 2 lands the punish on T+12. If no melee hit lands by T+15, the beam fires on T+16 for 99.

A rep is clean when both boulders are on their tiles, you punished with the special, and you took no damage. The crystal halberd reaches 2 tiles and attacks every 7 ticks. Its special, Sweep, costs 30% energy and hits Doom twice. Each hitsplat on the charge adds the punish bonus, 23 in the wiki's example gear.

The wiki shows the setup from the east side. In its Rockblock tile markers, tile 1 is 41,37 and Doom's centre is 31,37. Tile 2 (5 tiles north of tile 1), the timing of the moves and a punish on T+13 come from its delve 8+ double rockblock setup clip. The sim turns the setup a quarter to the south side, so tile 2 is still on your right as you face Doom. The charge starting on T+3, its loop sound every tick and the cancel on a punish were timed from the audio of the wiki's clips. The beam on T+16 is an estimate: in the delve 8 clip the charge bar fills at a steady rate that would complete it about 12.4 ticks after it starts.

## Sound cues

The sim plays the game's own sound effects at the same moments as in game.

| When | Sound |
| --- | --- |
| T−2 and T+1 | Doom's throw animation: a hiss, the rock being lifted, then a whoosh as it leaves his hands 0.76 s in |
| T+7 and T+10 | The rock explodes over you |
| T+9 and T+12 | The boulder and debris hit the ground, 0.2 s after the tick |
| T+11 to T+16 | Each barrage hit as it lands. Magic and ranged hits sound different. |

Your protection prayers make their in-game sound on the tick they switch on or off, and you grunt when something hits you.

In Rockblock + punish, Doom's melee charge has its own sounds:

| When | Sound |
| --- | --- |
| T+3 | The charge starts: a hiss and two grunts |
| Every tick after that | The charge loop, until the charge ends |
| Your punish | The charge is cancelled |
| T+16, if not punished | The beam fires |

OSRS stores sound effects as small synth programs and renders them while it plays. `synth.js` is a port of the game client's renderer. `tools/fetch_synths.py` pulls this fight's synths from the game cache through the [OpenRS2 Archive](https://archive.openrs2.org/). The ids and names are Jagex's, from RuneLite's game values: Doom's throw sounds are the frame sounds of its throw animation (sequence 12407), the charge sounds those of its beam charge, loop, cancel and fire animations (12408 to 12411), and the barrage reuses the Leviathan's magic and ranged impact sounds (7023 and 7026). Every timing above was confirmed by matching the renders against the audio of the OSRS Wiki's delve 8+ clips. The renders match the wiki's own recordings of the protection prayer sounds at a correlation of 0.95 or better.

## Running it locally

Download `site/index.html` and open it in a browser. Everything runs on your own machine.

## Building

`template.html` is the page source and `synth.js` the sound renderer. `build-assets.json` holds the game sprites, packed as data URIs, and the sound synths.

```sh
python tools/build.py template.html build-assets.json double-rock-sim.html
python tools/build_site.py double-rock-sim.html build-assets.json site https://double-rock-sim.pages.dev/
```

The first command builds the bare page. The second wraps it as a complete web page in `site/`, with the link-preview tags that Discord and Reddit read. These scripts need only the Python standard library.

`tools/build_assets.py` rebuilds the sprites in `build-assets.json` from files downloaded from the OSRS Wiki, including the special attack orb's PNG and GIF. It needs `opencv-python-headless` and `numpy`. `python tools/fetch_synths.py build-assets.json 2762` refreshes the sounds from OpenRS2 cache 2762, the live game cache of 11 November 2026.

## Tests

```sh
bash tools/run_tests.sh
```

This builds the page, appends `test/harness-tail.html` and runs it in headless Chrome. The harness steps the sim tick by tick and runs 170 checks covering timings, damage, prayers, sounds, the rock flights, Rockblock + punish, the camera, saved settings and the page panels. If Chrome isn't at its usual Windows path, set `CHROME` to its location. Set `PYTHON` to choose the interpreter.

`test/shot-tail.html` freezes a scenario for screenshots. Append it to the built page and open the result with a hash such as `#barrage`.

## License

The code is released under the MIT License. See [LICENSE](LICENSE).

The game sprites, renders and sound effect synths in `build-assets.json` and in the built pages are the property of Jagex Ltd. The sprites were taken from the [OSRS Wiki](https://oldschool.runescape.wiki/) and the synths from the game cache through the OpenRS2 Archive. None of them are covered by the MIT License.

This is an unofficial fan project. It is not endorsed by or affiliated with Jagex.
