import { use, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanThreadHistory,
  cleanSelectedThread,
} from '@/utils/app/clean';
import {
  saveThread,
  saveThreads,
  updateThread,
} from '@/utils/app/thread';
import { getSettings } from '@/utils/app/settings';

import { Thread } from '@/types/assistant';
import { Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';

import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

interface Props {
  serverSideApiKeyIsSet: boolean;
  assistantId: string | null;
}

const Home = ({
  serverSideApiKeyIsSet,
  assistantId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getAssistant, createThread } = useApiService();
  const { getAssistantError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      threads,
      selectedThread,
    },
    dispatch,
  } = contextValue;

  const stopThreadRef = useRef<boolean>(false);

  // FETCH MODELS ----------------------------------------------

  const { data, error } = useQuery(
    ['GetAssistant', assistantId, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!assistantId || !serverSideApiKeyIsSet) return null;

      return getAssistant(
        {
          a_id: assistantId
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) {
      dispatch({ field: 'assistant', value: data });
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({ field: 'assistantError', value: getAssistantError(error) });
  }, [dispatch, error, getAssistantError]);


  // THREAD OPERATIONS  --------------------------------------------

  const handleSelectThread = (thread: Thread) => {
    dispatch({
      field: 'selectedThread',
      value: thread,
    });

    saveThread(thread);
  };

  const handleNewThread = async () => {
    // returned data is of type string, ignore type error
    // @ts-ignore
    const newThreadId = await createThread({ messages: undefined }) as string;
    const newThread: Thread = {
      id: newThreadId,
      name: t('New Thread'),
      messages: []
    }

    const updatedThreads = [...threads, newThread];

    dispatch({ field: 'selectedThread', value: newThread });
    dispatch({ field: 'threads', value: updatedThreads });

    saveThread(newThread);
    saveThreads(updatedThreads);

    dispatch({ field: 'loading', value: false });
  };

  const handleUpdateThread = (
    thread: Thread,
    data: KeyValuePair,
  ) => {
    const updatedThread = {
      ...thread,
      [data.key]: data.value,
    };

    const { single, all } = updateThread(
      updatedThread,
      threads,
    );

    dispatch({ field: 'selectedThread', value: single });
    dispatch({ field: 'threads', value: all });
  };

  // RUN      --------------------------------------------
  const handleCreateRun = async (message?: Message) => {
    try {
      const runResponse = await fetch(`/api/assistants/threads/${selectedThread?.id}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistant_id: assistantId,
          message
        })
      });

      const runData = await runResponse.json();

      dispatch({ field: 'latestRun', value: runData });

      message && await handleUpdateThread(selectedThread!, {
        key: 'messages',
        value: [...selectedThread!.messages, message]
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  const handleCancelRun = async (runId: string) => {
    try {
      const runResponse = await fetch(`/api/assistants/threads/${selectedThread?.id}/runs/${runId}/cancel`, {
        method: 'POST'
      });

      if (!runResponse.ok) {
        throw (await runResponse.text())
      }

      const runData = await runResponse.json();

      dispatch({ field: 'latestRun', value: runData });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  const handlePollRun = async (runId: string) => {
    try {
      const runResponse = await fetch(`/api/assistants/threads/${selectedThread?.id}/runs/${runId}`);

      const runData = await runResponse.json();

      dispatch({ field: 'latestRun', value: runData });
    } catch (err) {
      console.log(err);
    }
  }

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [dispatch, selectedThread]);

  useEffect(() => {
    assistantId &&
      dispatch({ field: 'assistantId', value: assistantId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
  }, [assistantId, dispatch, serverSideApiKeyIsSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }
 
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const threadHistory = localStorage.getItem('threadHistory');
    if (threadHistory) {
      const parsedthreadHistory: Thread[] =
        JSON.parse(threadHistory);
      const cleanedthreadHistory = cleanThreadHistory(
        parsedthreadHistory,
      );

      dispatch({ field: 'threads', value: cleanedthreadHistory });
    }

    const selectedThread = localStorage.getItem('selectedThread');
    if (selectedThread) {
      const parsedSelectedThread: Thread =
        JSON.parse(selectedThread);
      const cleanedSelectedThread = cleanSelectedThread(
        parsedSelectedThread,
      );

      dispatch({
        field: 'selectedThread',
        value: cleanedSelectedThread,
      });
    } else {
      handleNewThread();
    }
  }, [
    dispatch,
    handleNewThread,
    serverSideApiKeyIsSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewThread,
        handleSelectThread,
        handleUpdateThread,
        handleCreateRun,
        handleCancelRun,
        handlePollRun
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedThread && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedThread={selectedThread}
              onNewThread={handleNewThread}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />

            <div className="flex flex-1">
              <Chat stopThreadRef={stopThreadRef} />
            </div>
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const assistantId = process.env.OPENAI_ASSISTANT_ID ?? null;

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      assistantId,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
