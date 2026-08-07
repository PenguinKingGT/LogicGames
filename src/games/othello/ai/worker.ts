/// <reference lib="webworker" />
import { chooseMove } from "./search";
import type { AiRequest, AiResponse } from "./worker-protocol";

self.onmessage = (event: MessageEvent<AiRequest>) => {
  const request = event.data;
  if (request.type !== "choose-move") return;
  const response: AiResponse = {
    type: "move",
    roundId: request.roundId,
    turnId: request.turnId,
    result: chooseMove(request.board, request.player, request.difficulty, {
      random: request.random,
    }),
  };
  self.postMessage(response);
};
