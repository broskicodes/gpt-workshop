import { useCallback, useContext, useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import HomeContext from '@/pages/api/home/home.context';

import { ChatbarSettings } from './components/ChatbarSettings';
import { Threads } from './components/Threads';

import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.state';

import { v4 as uuidv4 } from 'uuid';
import { saveThread, saveThreads } from '@/utils/app/thread';
import { Thread } from '@/types/assistant';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { threads, showChatbar,  },
    dispatch: homeDispatch,
    handleNewThread,
    handleUpdateThread,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredThreads },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey });

      localStorage.setItem('apiKey', apiKey);
    },
    [homeDispatch],
  );

  const handleClearThreads = async () => {
    homeDispatch({ field: 'threads', value: [] });

    localStorage.removeItem('threadHistory');
    localStorage.removeItem('selectedThread');

    await handleNewThread();
  };

  const handleDeleteThread = async (thread: Thread) => {
    const updatedThreads = threads.filter(
      (c) => c.id !== thread.id,
    );

    homeDispatch({ field: 'threads', value: updatedThreads });
    chatDispatch({ field: 'searchTerm', value: '' });
    saveThreads(updatedThreads);

    if (updatedThreads.length > 0) {
      homeDispatch({
        field: 'selectedThread',
        value: updatedThreads[updatedThreads.length - 1],
      });

      saveThread(updatedThreads[updatedThreads.length - 1]);
    } else {
      localStorage.removeItem('selectedThread');
      await handleNewThread();
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredThreads',
        value: threads.filter((thread) => {
          const searchable =
            thread.name.toLocaleLowerCase() +
            ' ' +
            thread.messages.map((message) => message.content).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredThreads',
        value: threads,
      });
    }
  }, [searchTerm, threads, chatDispatch]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteThread,
        handleClearThreads,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Thread>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Threads threads={filteredThreads} />}
        items={filteredThreads}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewThread}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
