import {
  IconCheck,
  IconMessage,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  KeyboardEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Thread } from '@/types/assistant';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';

interface Props {
  thread: Thread;
}

export const ThreadComponent = ({ thread }: Props) => {
  const {
    state: { selectedThread, messageIsStreaming },
    handleSelectThread,
    handleUpdateThread,
  } = useContext(HomeContext);

  const { handleDeleteThread } = useContext(ChatbarContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectedThread && handleRename(selectedThread);
    }
  };

  const handleDragStart = (
    e: DragEvent<HTMLButtonElement>,
    thread: Thread,
  ) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('thread', JSON.stringify(thread));
    }
  };

  const handleRename = (thread: Thread) => {
    if (renameValue.trim().length > 0) {
      handleUpdateThread(thread, {
        key: 'name',
        value: renameValue,
      });
      setRenameValue('');
      setIsRenaming(false);
    }
  };

  const handleConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (isDeleting) {
      handleDeleteThread(thread);
    } else if (isRenaming) {
      handleRename(thread);
    }
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleOpenRenameModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    selectedThread && setRenameValue(selectedThread.name);
  };
  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
    <div className="relative flex items-center">
      {isRenaming && selectedThread?.id === thread.id ? (
        <div className="flex w-full items-center gap-3 rounded-lg bg-[#343541]/90 p-3">
          <IconMessage size={18} />
          <input
            className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90 ${
            messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
          } ${
            selectedThread?.id === thread.id
              ? 'bg-[#343541]/90'
              : ''
          }`}
          onClick={() => handleSelectThread(thread)}
          disabled={messageIsStreaming}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, thread)}
        >
          <IconMessage size={18} />
          <div
            className={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 ${
              selectedThread?.id === thread.id ? 'pr-12' : 'pr-1'
            }`}
          >
            {thread.name}
          </div>
        </button>
      )}

      {(isDeleting || isRenaming) &&
        selectedThread?.id === thread.id && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton handleClick={handleConfirm}>
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton handleClick={handleCancel}>
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

      {selectedThread?.id === thread.id &&
        !isDeleting &&
        !isRenaming && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton handleClick={handleOpenRenameModal}>
              <IconPencil size={18} />
            </SidebarActionButton>
            <SidebarActionButton handleClick={handleOpenDeleteModal}>
              <IconTrash size={18} />
            </SidebarActionButton>
          </div>
        )}
    </div>
  );
};
