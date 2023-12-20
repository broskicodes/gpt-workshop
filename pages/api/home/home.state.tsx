import { Message } from '@/types/chat';
import { Assistant, Run, Thread } from '@/types/assistant';
import { ErrorMessage } from '@/types/error';
import { OpenAIModel } from '@/types/openai';
import { PluginKey } from '@/types/plugin';

export interface HomeInitialState {
  apiKey: string;
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  assistantError: ErrorMessage | null;
  threads: Thread[];
  selectedThread: Thread | undefined;
  currentMessage: Message | undefined;
  showChatbar: boolean;
  messageError: boolean;
  searchTerm: string;
  assistantId: string | null;
  assistant: Assistant | null;
  latestRun: Run | null;
  serverSideApiKeyIsSet: boolean;
}

export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  lightMode: 'dark',
  messageIsStreaming: false,
  assistantError: null,
  threads: [],
  selectedThread: undefined,
  currentMessage: undefined,
  showChatbar: true,
  messageError: false,
  searchTerm: '',
  assistantId: null,
  assistant: null,
  latestRun: null,
  serverSideApiKeyIsSet: false,
};
