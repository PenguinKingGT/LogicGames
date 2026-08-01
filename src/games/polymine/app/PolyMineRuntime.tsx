"use client";

import { useEffect, useState } from "react";
import { App } from "./App";
import { GameController } from "./GameController";

export default function PolyMineRuntime({
  createController = () => new GameController(),
}: {
  createController?: () => GameController;
}) {
  const [controller] = useState(createController);

  useEffect(() => () => controller.destroy(), [controller]);

  return <App controller={controller} />;
}
