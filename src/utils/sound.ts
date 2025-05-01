
// Sound utility functions for the application

/**
 * Play the notification sound
 * @returns Promise that resolves when the sound has played or rejects if there was an error
 */
export const playNotificationSound = (): Promise<void> => {
  const audio = new Audio('/notification-sound.mp3');
  audio.currentTime = 0; // Reset to start
  return audio.play();
};
