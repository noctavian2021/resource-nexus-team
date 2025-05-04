
/**
 * Play the notification sound with error handling
 * @returns Promise that resolves when the sound is played
 */
export const playNotificationSound = async (): Promise<void> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      console.log('Audio playback is not supported in this environment');
      return;
    }
    
    const audio = new Audio('/notification-sound.mp3');
    
    // Add error handling for loading the sound file
    audio.onerror = (error) => {
      console.log('Error loading notification sound:', error);
    };
    
    // Return a promise that resolves when the sound plays or errors
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (error) => {
        console.log('Error playing notification sound:', error);
        resolve(); // Resolve anyway to prevent blocking
      };
      
      // Try to play the sound
      audio.play().catch(err => {
        // Handle cases where autoplay is blocked or file not found
        console.log('Audio playback was prevented:', err.message);
        resolve(); // Resolve anyway to prevent blocking
      });
    });
  } catch (err) {
    console.log('Error initializing notification sound:', err);
    return Promise.resolve(); // Return resolved promise to prevent blocking
  }
};
