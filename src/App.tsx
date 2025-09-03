import React, { useRef, useState, useEffect } from "react";
import { Application, extend, useApplication, useTick } from "@pixi/react";
import { Assets, Container, Sprite, Texture } from "pixi.js";
import BetBar from "./BetBar";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Sprite,
});

const BgSprite = () => {
  const { app } = useApplication();
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/bg.png").then(setTexture);
    }
  }, [texture]);

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0}
      x={0}
      y={0}
      width={app.screen.width}
      height={app.screen.height}
    />
  );
};

const NameSprite = () => {
  const { app } = useApplication();
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/name.png").then(setTexture);
    }
  }, [texture]);

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={app.screen.width / 2}
      y={60}
      width={300}
      height={80}
    />
  );
};

const PrizeSprite = ({ x, y }: { x: number; y: number }) => {
  const { app } = useApplication();
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/prize.png").then(setTexture);
    }
  }, [texture]);

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={x}
      y={y}
      width={80}
      height={80}
    />
  );
};

const CupSprite = ({ x, y, onClick }: { x: number; y: number; onClick?: () => void }) => {
  const { app } = useApplication();
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/redcup.png").then(setTexture);
    }
  }, [texture]);

  // Setup interactivity for the cups
  useEffect(() => {
    if (spriteRef.current && texture !== Texture.EMPTY && onClick) {
      spriteRef.current.eventMode = 'static';
      spriteRef.current.cursor = 'pointer';
      spriteRef.current.on('pointertap', onClick);
      return () => {
        spriteRef.current?.off('pointertap', onClick);
      };
    }
  }, [texture, onClick]);

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={x}
      y={y}
      width={80}
      height={100}
    />
  );
};

const CupStage = React.forwardRef((props, ref) => {
  const initialCups = [
    { id: "left", x: 300, y: 320 },
    { id: "center", x: 500, y: 320 },
    { id: "right", x: 700, y: 320 },
  ];
  const prizePosition = { x: 500, y: 400 };
  const [cupPositions, setCupPositions] = useState(initialCups);
  const [targetPositions, setTargetPositions] = useState(initialCups);
  const [shuffling, setShuffling] = useState(false);
  const shuffleStep = useRef(0);

  // Expose startShuffle to parent via ref
  React.useImperativeHandle(ref, () => ({
    startShuffle: () => {
      console.log('CupStage.startShuffle called');
      setShuffling(true);
      shuffleStep.current = 0;
      // Set target positions to swapped
      setTargetPositions((prev) => {
        const newPos = [...prev];
        [newPos[0], newPos[2]] = [newPos[2], newPos[0]];
        return newPos;
      });
    }
  }));

  // Smoothly animate cup positions towards targetPositions
  useTick(() => {
    if (!shuffling) return;
    let done = true;
    setCupPositions((prev) => {
      return prev.map((cup, i) => {
        const target = targetPositions[i];
        let dx = target.x - cup.x;
        let dy = target.y - cup.y;
        // If not at target, move a fraction towards it
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          done = false;
          return {
            ...cup,
            x: cup.x + dx * 0.2,
            y: cup.y + dy * 0.2,
          };
        }
        return { ...cup, x: target.x, y: target.y };
      });
    });
    if (done) {
      setShuffling(false);
    }
  });

  return (
    <>
      <BgSprite />
      <NameSprite />
      <PrizeSprite x={prizePosition.x} y={prizePosition.y} />
      {cupPositions.map((pos) => (
        <CupSprite key={pos.id} x={pos.x} y={pos.y} onClick={() => {
          console.log(`Cup ${pos.id} clicked!`);
        }} />
      ))}
    </>
  );
});

export default function App() {
  const cupStageRef = useRef<any>(null);
  const handleTest = () => {
    console.log('Test button pressed');
    if (cupStageRef.current) {
      console.log('Calling startShuffle on CupStage ref');
      cupStageRef.current.startShuffle();
    } else {
      console.warn('CupStage ref is null');
    }
  };
  return (
    <>
      <Application background={"#1099bb"} resizeTo={window}>
        <CupStage ref={cupStageRef} />
      </Application>
      <BetBar onTest={handleTest} />
    </>
  );
}
