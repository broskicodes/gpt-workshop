import { IconClearAll, IconSettings } from '@tabler/icons-react';
import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { throttle } from '@/utils/data/throttle';

import { Message } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { RunStatus, Thread } from '@/types/assistant';

interface Props {
  stopThreadRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopThreadRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedThread,
      threads,
      apiKey,
      assistant,
      assistantError,
      latestRun,
      messageIsStreaming,
      loading,
    },
    handleUpdateThread,
    handleCreateRun,
    handlePollRun,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0) => {
      if (selectedThread) {
        let updatedThread: Thread;
        if (deleteCount) {
          const updatedMessages = [...selectedThread.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedThread = {
            ...selectedThread,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedThread = {
            ...selectedThread,
            messages: [...selectedThread.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedThread',
          value: updatedThread,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
       
        const res = await handleCreateRun(message);
        
        if (!res) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
        
        return;
      }
    },
    [
      apiKey,
      threads,
      selectedThread,
      handleCreateRun,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedThread
    ) {
      handleUpdateThread(selectedThread, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    // console.log('latestRun', latestRun?.status);
    switch (latestRun?.status) {
      case RunStatus.Completed:
        // TODO: handle completed run
        fetch(`/api/assistants/threads/${latestRun.thread_id}/messages`).then((res) => {
          res.json().then((data) => {
            const message: Message = {
              role: data.role,
              // TODO: handle complex parsing of message content array
              content: data.content[0].text.value,
            }

            handleUpdateThread(selectedThread!, { key: 'messages', value: [...selectedThread!.messages, message] });
            homeDispatch({ field: 'loading', value: false });
            homeDispatch({ field: 'messageIsStreaming', value: false });
            homeDispatch({ field: 'latestRun', value: undefined });
          });
        });

        break;
      case RunStatus.Failed:
      case RunStatus.Cancelled:
      case RunStatus.Expired:
        toast.error(t('Run stopped'));
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
        homeDispatch({ field: 'latestRun', value: undefined });
        break;
      case RunStatus.RequiresAction:
        // TODO: handle requires action
        // if (!handlingAction) {
        //   handleChatAction();
        // }
        // break;
      case RunStatus.Cancelling:
      case RunStatus.Queued:
      case RunStatus.InProgress:
        const pollInterval = setInterval(() => {
          handlePollRun(latestRun.id);
        }, 1000);
        return () => clearInterval(pollInterval);
    }
  }, [latestRun, handlePollRun, handleUpdateThread]);

  useEffect(() => {
    throttledScrollDown();
    selectedThread &&
      setCurrentMessage(
        selectedThread.messages[selectedThread.messages.length - 2],
      );
  }, [selectedThread, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      { assistantError ? (
        <ErrorMessageDiv error={assistantError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {!selectedThread?.messages || selectedThread?.messages.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {!assistant ? (
                      <div>
                        <Spinner size="16px" className="mx-auto" />
                      </div>
                    ) : (
                      'Chatbot UI'
                    )}
                  </div>

                  {assistant && (
                    <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                      {t('Say hello to your assistant :)')}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  {t('Assistant')}: {assistant?.name} |
                  {/* <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button> */}
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                </div>
                {/* {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )} */}

                {selectedThread?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedThread?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader />}

                <div
                  className="h-[162px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopThreadRef={stopThreadRef}
            textareaRef={textareaRef}
            onSend={(message) => {
              setCurrentMessage(message);
              handleSend(message, 0);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
