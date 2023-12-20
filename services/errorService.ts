import { useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import { ErrorMessage } from '@/types/error';

const useErrorService = () => {
  const { t } = useTranslation('chat');

  return {
    getAssistantError: useMemo(
      () => (error: any) => {
        return !error
          ? null
          : ({
              title: t('Error fetching assistant.'),
              code: error.status || 'unknown',
              messageLines: error.statusText
                ? [error.statusText]
                : [
                    t(
                      'Make sure your OpenAI API key is set in the .env.local file',
                    ),
                    t(
                      'Make sure your OpenAI Assistant ID key is set in the .env.local file',
                    ),
                    t(
                      'If you completed these step, OpenAI may be experiencing issues.',
                    ),
                  ],
            } as ErrorMessage);
      },
      [t],
    ),
  };
};

export default useErrorService;
