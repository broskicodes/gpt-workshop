import { Thread } from '@/types/assistant';

export const cleanSelectedThread = (thread: Thread) => {
  let updatedThread = thread;

  if (!updatedThread.messages) {
    updatedThread = {
      ...updatedThread,
      messages: updatedThread.messages || [],
    };
  }

  return updatedThread;
};

export const cleanThreadHistory = (history: any[]): Thread[] => {
  if (!Array.isArray(history)) {
    console.warn('history is not an array. Returning an empty array.');
    return [];
  }

  return history.reduce((acc: any[], thread) => {
    try {
      if (!thread.messages) {
        thread.messages = [];
      }

      acc.push(thread);
      return acc;
    } catch (error) {
      console.warn(
        `error while cleaning threads' history. Removing culprit`,
        error,
      );
    }
    return acc;
  }, []);
};
