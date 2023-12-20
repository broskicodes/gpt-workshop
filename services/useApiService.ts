import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';
import { Message } from 'postcss';

export interface GetAssistantsRequestProps {
  a_id: string;
}

export interface CreateThreadRequestProps {
  messages: Message[] | undefined;
}

const useApiService = () => {
  const fetchService = useFetch();

  const getAssistant = useCallback(
    (params: GetAssistantsRequestProps, signal?: AbortSignal) => {
      return fetchService.get<GetAssistantsRequestProps>(`/api/assistants/${params.a_id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  const createThread = useCallback(
    (params: CreateThreadRequestProps, signal?: AbortSignal) => {
      return fetchService.post<CreateThreadRequestProps>(`/api/assistants/threads`, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: { messages: params.messages },
        signal
      })
    }, [fetchService]
  );

  return {
    getAssistant,
    createThread
  };
};

export default useApiService;
