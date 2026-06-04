# Audio Assets — Prompts para ElevenLabs

Generá cada archivo en **ElevenLabs > Sound Effects**.  
Exportá en `.mp3` + `.ogg`. Guardá en la carpeta correspondiente (`sfx/` o `music/`).

---

## SFX

### `sfx/shoot`
```
A crisp, punchy laser pistol shot with a dry click and a short high-pitched zap tail. Sci-fi arcade style, very short 0.1 seconds, no reverb, clean and snappy.
```

---

### `sfx/target_hit`
```
A satisfying small explosion pop when a glowing circle target is destroyed. Short burst, 0.3 seconds, includes a quick whoosh and a punchy low thud. Arcade game style, bright and rewarding.
```

---


### `sfx/target_miss`
```
A short descending buzz indicating a missed opportunity or failure. 0.4 seconds. Sounds like a low-pitched electric beep going down in pitch, slightly harsh. Arcade game penalty sound.
```

---

### `sfx/lose_life`
```
A heavy impactful hit sound indicating the player lost a life. 0.5 seconds. Deep thud followed by a short downward whoosh and a subtle reverb tail. Sci-fi arcade tone, serious but not dramatic.
```

---

### `sfx/boss_start`
```
A dramatic orchestral stinger announcing the arrival of a boss enemy. 1.5 seconds. Starts with a deep rising siren, followed by a powerful brass hit and a low rumble. Intense and alarming, sci-fi game style.
```

---

### `sfx/boss_critical_hit`
```
A metallic electric impact sound when hitting a critical weak point on a boss. 0.2 seconds. Short sharp clang with an electric crackle. Sounds like shooting a metal plate with a sci-fi energy weapon. Punchy, no reverb.
```

---

### `sfx/boss_critical_destroy`
```
An explosive destruction sound when a boss critical node is eliminated. 0.5 seconds. Bigger than a normal hit: electric burst, crunch, and a short downward pitch sweep. Satisfying but weighted, sci-fi arcade style.
```

---

### `sfx/boss_defeat`
```
A short victory fanfare when the boss is defeated. 1.5 seconds. Bright ascending synth chord followed by a big explosion burst and a sparkling tail. Feels triumphant and rewarding. Sci-fi electronic style.
```

---

### `sfx/boss_timeout`
```
A failure alarm sound when the boss phase timer runs out and the player takes damage. 1 second. Low ominous buzz, descending tone, and a heavy thud. Dark and punishing. No music, pure effect.
```

---

### `sfx/game_over`
```
A dramatic game over stinger. 2 seconds. Starts with a deep descending synthesizer note that slows down and fades into silence with a subtle low rumble. Feels final and heavy. Retro arcade meets sci-fi.
```

---

## Música

> ElevenLabs también genera música con texto. Usá la sección **Music Generation** si está disponible, o usá los prompts en **Suno / Udio** como alternativa.

### `music/gameplay`
```
Tense synthwave electronic background music for a sci-fi arcade shooter game. Steady driving beat at 120 BPM, pulsing bass synth, arpeggiated lead melody, subtle tension. Loops perfectly with no gap. Duration 90 seconds. Dark neon aesthetic, similar to an 80s retro arcade game soundtrack.
```

### `music/boss`
```
Intense aggressive synthwave boss battle music for a sci-fi arcade game. Fast driving beat at 140 BPM, heavy distorted bass, urgent lead synth, building tension throughout. Darker and more aggressive than regular gameplay music. Loops perfectly with no gap. Duration 60 seconds. Feels like a climactic confrontation.
```

---

## Configuración de exportación

| Parámetro | Valor |
|-----------|-------|
| Formato | MP3 + OGG |
| Sample rate | 44100 Hz |
| Bit depth | 16-bit |
| SFX duración máx | 3s |
| Música — loop sin gap | Sí |

---

## Dónde guardar

```
public/assets/audio/
├── sfx/
│   ├── shoot.mp3 + shoot.ogg
│   ├── target_hit.mp3 + target_hit.ogg
│   ├── target_miss.mp3 + target_miss.ogg
│   ├── lose_life.mp3 + lose_life.ogg
│   ├── boss_start.mp3 + boss_start.ogg
│   ├── boss_critical_hit.mp3 + boss_critical_hit.ogg
│   ├── boss_critical_destroy.mp3 + boss_critical_destroy.ogg
│   ├── boss_defeat.mp3 + boss_defeat.ogg
│   ├── boss_timeout.mp3 + boss_timeout.ogg
│   └── game_over.mp3 + game_over.ogg
└── music/
    ├── gameplay.mp3 + gameplay.ogg
    └── boss.mp3 + boss.ogg
```
