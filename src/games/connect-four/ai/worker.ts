/// <reference lib="webworker" />

import { chooseMove } from "./search";
import type { AiRequest, AiResponse } from "./worker-protocol";

self.onmessage = (event: MessageEvent<AiRequest>) => {
  const request = event.data;
  const result = chooseMove(request.board, request.player, request.difficulty, {
    random: request.random,
    timeBudgetMs: request.difficulty === "hard" ? 500 : 10_000,
  });
  const response: AiResponse = {
    type: "move-selected",
    result,
    roundId: request.roundId,
    turnId: request.turnId,
  };
  self.postMessage(response);
};
