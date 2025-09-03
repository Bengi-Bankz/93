import { balance } from "./Store2";
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

const CupSprite = ({
  x,
  y,
  onClick,
}: {
  x: number;
  y: number;
  onClick?: () => void;
}) => {
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
      spriteRef.current.eventMode = "static";
      spriteRef.current.cursor = "pointer";
      spriteRef.current.on("pointertap", onClick);
      return () => {
        spriteRef.current?.off("pointertap", onClick);
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
  const [lifting, setLifting] = useState(false);
  const [liftPhase, setLiftPhase] = useState<"up" | "pause" | "down" | null>(
    null,
  );
  const liftFrame = useRef(0);
  const shuffleSequence = useRef<number[][]>([]);
  const currentShuffle = useRef(0);
  const shufflePhase = useRef<"first" | "second" | null>(null);
  const swapProgress = useRef(0);

  // Helper to generate a random shuffle sequence
  function generateShuffleSequence(steps = 8) {
    const swaps = [
      [0, 1], // left-center
      [1, 2], // center-right
      [0, 2], // left-right
    ];
    const seq = [];
    for (let i = 0; i < steps; i++) {
      seq.push(swaps[Math.floor(Math.random() * swaps.length)]);
    }
    return seq;
  }

  // Expose startShuffle to parent via ref
  React.useImperativeHandle(ref, () => ({
    startShuffle: () => {
      console.log("CupStage.startShuffle called");
      // Start lift animation first
      setLifting(true);
      setLiftPhase("up");
      liftFrame.current = 0;
      setShuffling(false);
      shufflePhase.current = null;
      swapProgress.current = 0;
    },
  }));

  // Animate each swap in the sequence
  useTick(() => {
    // Lifting animation for center cup
    if (lifting) {
      if (liftPhase === "up") {
        liftFrame.current++;
        setCupPositions((prev) =>
          prev.map((cup, i) => (i === 1 ? { ...cup, y: cup.y - 3 } : cup)),
        );
        if (liftFrame.current >= 20) {
          setLiftPhase("pause");
          liftFrame.current = 0;
        }
      } else if (liftPhase === "pause") {
        liftFrame.current++;
        if (liftFrame.current >= 15) {
          setLiftPhase("down");
          liftFrame.current = 0;
        }
      } else if (liftPhase === "down") {
        liftFrame.current++;
        setCupPositions((prev) =>
          prev.map((cup, i) => (i === 1 ? { ...cup, y: cup.y + 3 } : cup)),
        );
        if (liftFrame.current >= 20) {
          setLifting(false);
          setLiftPhase(null);
          liftFrame.current = 0;
          // Start shuffle after lift
          shuffleSequence.current = generateShuffleSequence(
            12 + Math.floor(Math.random() * 6),
          );
          currentShuffle.current = 0;
          shufflePhase.current = null;
          swapProgress.current = 0;
          setShuffling(true);
        }
      }
      return;
    }
    // Shuffle animation
    if (!shuffling) return;
    if (currentShuffle.current < shuffleSequence.current.length) {
      const [a, b] = shuffleSequence.current[currentShuffle.current];
      // Staggered swap: first move cup a, then cup b
      if (!shufflePhase.current) {
        shufflePhase.current = "first";
        swapProgress.current = 0;
      }
      if (shufflePhase.current === "first") {
        swapProgress.current++;
        setCupPositions((prev) => {
          const newPos = [...prev];
          // Move cup a towards cup b's x
          const targetX = initialCups[b].x;
          const dx = targetX - newPos[a].x;
          newPos[a] = {
            ...newPos[a],
            x: Math.abs(dx) > 1 ? newPos[a].x + dx * 0.09 : targetX,
          };
          return newPos;
        });
        // Check if cup a reached target
        if (swapProgress.current > 32) {
          shufflePhase.current = "second";
          swapProgress.current = 0;
        }
      } else if (shufflePhase.current === "second") {
        swapProgress.current++;
        setCupPositions((prev) => {
          const newPos = [...prev];
          // Move cup b towards cup a's original x
          const targetX = initialCups[a].x;
          const dx = targetX - newPos[b].x;
          newPos[b] = {
            ...newPos[b],
            x: Math.abs(dx) > 1 ? newPos[b].x + dx * 0.09 : targetX,
          };
          return newPos;
        });
        // Check if cup b reached target
        if (swapProgress.current > 32) {
          // Swap cup data for next shuffle
          setCupPositions((prev) => {
            const newPos = [...prev];
            [newPos[a], newPos[b]] = [newPos[b], newPos[a]];
            return newPos;
          });
          shufflePhase.current = null;
          swapProgress.current = 0;
          currentShuffle.current++;
        }
      }
    } else {
      setShuffling(false);
    }
  });

  return (
    <>
      <BgSprite />
      <NameSprite />
      <PrizeSprite x={prizePosition.x} y={prizePosition.y} />
      {cupPositions.map((pos) => (
        <CupSprite
          key={pos.id}
          x={pos.x}
          y={pos.y}
          onClick={() => {
            console.log(`Cup ${pos.id} clicked!`);
          }}
        />
      ))}
    </>
  );
});

export default function App() {
  // Subscribe to Svelte balance store
  const [currentBalance, setCurrentBalance] = useState(0);
  useEffect(() => {
    const unsubscribe = balance.subscribe(setCurrentBalance);
    return unsubscribe;
  }, []);
  const cupStageRef = useRef<any>(null);
  const handleTest = () => {
    console.log("Test button pressed");
    if (cupStageRef.current) {
      console.log("Calling startShuffle on CupStage ref");
      cupStageRef.current.startShuffle();
    } else {
      console.warn("CupStage ref is null");
    }
  };
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 100,
          fontSize: "1.2em",
          fontWeight: "bold",
          background: "rgba(255,255,255,0.95)",
          padding: "10px 22px",
          borderRadius: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          color: "#222",
          maxWidth: "90vw",
          maxHeight: "8vh",
          overflow: "hidden",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Balance: {currentBalance}
      </div>
      <Application background={"#1099bb"} resizeTo={window}>
        <CupStage ref={cupStageRef} />
      </Application>
      <BetBar onTest={handleTest} />
    </>
  );
}
