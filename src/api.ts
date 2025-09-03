// Mock API functions for the game
// In a real implementation, these would make actual HTTP requests

export interface PlayResponse {
  roundId: string;
  winningCup: number; // 0, 1, or 2 for left, center, right
  winAmount: number;
  success: boolean;
}

export const playAPI = async (betAmount: number): Promise<PlayResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock response - in real implementation this would come from server
  const winningCup = Math.floor(Math.random() * 3);
  const isWin = Math.random() < 0.3; // 30% win rate
  const winAmount = isWin ? betAmount * 2 : 0;

  return {
    roundId: `round_${Date.now()}`,
    winningCup,
    winAmount,
    success: true,
  };
};
