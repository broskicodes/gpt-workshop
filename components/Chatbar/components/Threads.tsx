import { Thread } from '@/types/assistant';

import { ThreadComponent } from './Thread';

interface Props {
  threads: Thread[];
}

export const Threads = ({ threads }: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {threads
        .slice()
        .reverse()
        .map((thread, index) => (
          <ThreadComponent key={index} thread={thread} />
        ))}
    </div>
  );
};
