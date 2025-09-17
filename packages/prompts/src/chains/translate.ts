import { ChatStreamPayload } from '@lobechat/types';

export const chainTranslate = (
  content: string,
  targetLang: string,
): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content:
        'You are an assistant skilled at translation. You need to translate the input language to the target language',
      role: 'system',
    },
    {
      content: `Please translate the following content ${content} to ${targetLang}`,
      role: 'user',
    },
  ],
});
