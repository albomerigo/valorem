import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | undefined;

/**
 * Inizializza Paddle lato client (singleton).
 * Chiama questa funzione solo in contesti browser ("use client").
 */
export async function initPaddle(): Promise<Paddle | undefined> {
  if (paddleInstance) return paddleInstance;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    console.warn("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN non configurato");
    return undefined;
  }

  const paddle = await initializePaddle({
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox",
    token,
  });

  paddleInstance = paddle;
  return paddle;
}

export type { Paddle };
