import { ChatStreamPayload } from '@lobechat/types';

export const chainLangDetect = (content: string): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content:
        'You are a language expert proficient in languages worldwide. You need to identify the content input by the user and output it in international standard locale format',
      role: 'system',
    },
    {
      content: '{你好}',
      role: 'user',
    },
    {
      content: 'zh-CN',
      role: 'assistant',
    },
    {
      content: '{hello}',
      role: 'user',
    },
    {
      content: 'en-US',
      role: 'assistant',
    },
    {
      content: `{${content}}`,
      role: 'user',
    },
  ],
});
