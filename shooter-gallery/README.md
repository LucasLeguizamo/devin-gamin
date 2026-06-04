# Shooter Gallery

Juego arcade hecho con Phaser, Vite y TypeScript. El jugador destruye objetivos antes de que expiren, acumula puntaje y entra en fases de boss cada cierto numero de bajas.

## Estado actual

- El proyecto compila con `pnpm build`.
- El juego corre en Vite con `pnpm dev`.
- El flujo principal existe: targets, vidas, score, boss y game over.
- La tabla de posiciones todavia no esta implementada.
- Hay definicion de audio y manifiesto de assets, pero falta integrar carga/reproduccion y agregar archivos reales.

## Como correrlo

```bash
pnpm install
pnpm dev
```

URL local:

```text
http://localhost:5173/
```

Build de verificacion:

```bash
pnpm build
```

## Roadmap priorizado

### P0 - Estabilizar el flujo jugable

- Corregir el error al expirar targets: `Target.expire()` puede fallar cuando el objetivo ya no conserva una referencia valida de escena.
- Hacer `Target.expire()` y `Target.explode()` idempotentes: si el target ya esta destruido o en transicion, no debe volver a crear tweens ni emitir efectos.
- Desactivar input de targets al expirar o explotar para evitar clicks tardios durante el fade.
- Proteger `onTargetDestroyed()` contra doble click, eventos repetidos o targets ya eliminados.
- Agregar flag `isGameOver` para cortar `update`, handlers y timers cuando la partida ya termino.
- Validar que perder vidas, llegar a `Vidas: 0` y abrir `GameOverScene` no deje listeners, tweens ni targets vivos.
- Asegurar que reiniciar desde game over limpia score, vidas, boss, cooldown de disparo y eventos globales.
- Agregar una forma de QA/debug para llegar rapido al boss sin matar 20 targets manualmente.
- Revisar colisiones/clicks en canvas escalado para que el input se sienta consistente en distintas resoluciones.
- Desactivar input de puntos criticos del boss cuando quedan destruidos para que no sigan participando en hit-test.

### P1 - Tabla de posiciones

- Guardar puntajes al terminar partida.
- Pedir nombre o iniciales del jugador en `GameOverScene`.
- Mostrar top 10 ordenado por puntaje.
- Crear `src/services/LeaderboardStore.ts` con `getTopScores()`, `submitScore()`, `isHighScore()` y `clear()` para debug.
- Crear `src/types/leaderboard.ts` con el contrato de entrada.
- Guardar datos minimos de primera version: `id`, `name`, `score` y `createdAt`.
- Preparar campos opcionales para futuro: `kills`, `bossesDefeated`, `durationMs` y `difficultyVersion`.
- Implementar persistencia local con `localStorage` como primera version.
- Usar una key versionada, por ejemplo `shooter-gallery:leaderboard:v1`.
- Tolerar storage corrupto con fallback a lista vacia.
- Definir desempate de scores iguales por fecha.
- Preparar una interfaz de almacenamiento para poder migrar luego a backend sin reescribir escenas.
- Agregar una vista accesible desde game over y desde un menu inicial.

### P1 - UX y pantallas

- Crear menu inicial con acciones: jugar, tabla de posiciones, sonido on/off y creditos/controles.
- Mejorar `GameOverScene` para incluir ranking, nuevo record y acciones claras.
- Agregar feedback visible de hit, miss, vida perdida, boss entrante y boss derrotado.
- Mostrar temporizador de boss en el HUD.
- Ajustar responsive para pantallas verticales y tamanos pequenos.
- Definir una direccion visual mas rica para targets, boss, fondo y efectos sin perder legibilidad.

### P2 - Audio

- Cargar audio desde `public/assets/audio`.
- Reproducir SFX para disparo, target hit, target miss, vida perdida, boss start, critical hit, boss defeat, boss timeout y game over.
- Agregar musica de gameplay y musica de boss en loop.
- Implementar mute/unmute persistente.
- Verificar fallback si faltan archivos `.mp3` o `.ogg`.

### P2 - Dificultad y balance

- Ajustar curva de spawn, velocidad y tamano de targets.
- Definir dificultad por niveles o waves.
- Medir duracion promedio de partida.
- Revisar recompensa de boss frente a score normal.
- Agregar combos o multiplicador si mejora el ritmo del juego.

### P3 - Calidad tecnica

- Separar persistencia, audio y estado de partida en managers dedicados.
- Agregar tipos compartidos para payloads de eventos.
- Documentar eventos globales como `ui:update`.
- Agregar checklist manual de QA.
- Evaluar tests unitarios para managers puros como dificultad, leaderboard y storage.

## Distribucion en subagentes

### Subagente 1 - Core gameplay y bugs

Responsable: `Sagan`

Scope:

- `src/scenes/GameScene.ts`
- `src/entities/Target.ts`
- `src/entities/Boss.ts`
- `src/managers/DifficultyManager.ts`
- `src/managers/SpawnManager.ts`

Entregables:

- Fix del bug de expiracion de targets.
- Idempotencia de `expire()`/`explode()`.
- Desactivacion de input en targets expirados/destruidos.
- Flag de cierre de partida para evitar eventos tardios despues de game over.
- QA de game over y reinicio.
- Modo debug para activar boss rapido.
- Lista de verificaciones manuales del core loop.

### Subagente 2 - Tabla de posiciones

Responsable: `Mill`

Scope:

- Nueva logica de leaderboard.
- `src/scenes/GameOverScene.ts`
- Nueva escena o panel de tabla de posiciones.
- Tipos y storage local.

Entregables:

- Modelo de datos de ranking.
- `LeaderboardStore` con key versionada en `localStorage`.
- Persistencia en `localStorage`.
- UI para capturar nombre/iniciales.
- Vista top 10.
- Punto de extension para backend futuro.

### Subagente 3 - UX, audio y polish

Responsable: `Jason`

Scope:

- `src/scenes/UIScene.ts`
- `src/scenes/BootScene.ts`
- `src/scenes/GameOverScene.ts`
- `src/style.css`
- `src/utils/audioKeys.ts`
- `public/assets/audio`

Entregables:

- Menu inicial.
- HUD mejorado con timer de boss.
- Integracion de SFX y musica.
- Mute/unmute persistente.
- Ajustes responsive y feedback visual.

## Criterios de aceptacion

- `pnpm build` pasa sin errores.
- No hay errores de consola durante: jugar, dejar expirar targets, perder vidas, matar targets, entrar a boss, perder boss, ganar boss, game over y reiniciar.
- El score final se guarda en tabla de posiciones.
- La tabla muestra top 10 estable aunque se reinicie la pagina.
- El juego sigue siendo usable en desktop y mobile portrait.
- Si faltan assets de audio, el juego no se rompe.

## Notas

- La tabla de posiciones es parte del alcance confirmado del juego.
- La primera version puede ser local; el backend queda como evolucion posterior.
- Mantener los cambios pequenos y verificables por frente para evitar conflictos entre subagentes.
