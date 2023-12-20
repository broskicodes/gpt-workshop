import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { KeyValuePair } from '@/types/data';

import { HomeInitialState } from './home.state';
import { Thread } from '@/types/assistant';
import { Message } from '@/types/chat';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewThread: () => Promise<void>;
  handleSelectThread: (thread: Thread) => void;
  handleUpdateThread: (
    thread: Thread,
    data: KeyValuePair,
  ) => void;
  handleCreateRun: (message?: Message) => Promise<boolean>;
  handleCancelRun: (runId: string) => Promise<boolean>;
  handlePollRun: (runId: string) => Promise<void>;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
