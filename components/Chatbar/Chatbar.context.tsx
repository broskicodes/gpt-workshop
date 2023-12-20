import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Thread } from '@/types/assistant';

import { ChatbarInitialState } from './Chatbar.state';

export interface ChatbarContextProps {
  state: ChatbarInitialState;
  dispatch: Dispatch<ActionType<ChatbarInitialState>>;
  handleDeleteThread: (thread: Thread) => void;
  handleClearThreads: () => void;
  handleApiKeyChange: (apiKey: string) => void;
}

const ChatbarContext = createContext<ChatbarContextProps>(undefined!);

export default ChatbarContext;
