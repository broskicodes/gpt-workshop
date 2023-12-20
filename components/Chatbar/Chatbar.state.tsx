import { Thread } from '@/types/assistant';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredThreads: Thread[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredThreads: [],
};
