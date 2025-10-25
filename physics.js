// physics.js
import * as M from 'https://esm.sh/matter-js@0.19.0';

export function createWorld() {
  const engine = M.Engine.create();
  const world = engine.world;

  // Player
  const player = M.Bodies.circle(200, 100, 20, { restitution: 0.2, frictionAir: 0.02 });

  // Floor and walls
  const floor  = M.Bodies.rectangle(400, 600, 800, 40, { isStatic: true });
  const left   = M.Bodies.rectangle(0,   300, 40, 600,  { isStatic: true });
  const right  = M.Bodies.rectangle(800, 300, 40, 600,  { isStatic: true });
  const ceil   = M.Bodies.rectangle(400, 0,   800, 40,  { isStatic: true });

  M.World.add(world, [player, floor, left, right, ceil]);

  // Some boxes to make it fun
  for (let i = 0; i < 10; i++) {
    const box = M.Bodies.rectangle(350 + i*10, 50 + i*5, 30, 30, { restitution: 0.1 });
    M.World.add(world, box);
  }

  const runner = M.Runner.create();
  M.Runner.run(runner, engine);

  return { M, engine, world, player };
}
