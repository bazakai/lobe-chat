import { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';

export const chainSummaryTitle = (
  messages: OpenAIChatMessage[],
  locale: string,
): Partial<ChatStreamPayload> => {
  return {
    messages: [
      {
        content:
          "You are an assistant skilled at conversations. You need to summarize the user's conversation into a title within 10 characters",
        role: 'system',
      },
      {
        content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

Please summarize the above conversation into a title within 10 characters, no punctuation marks needed, output language: ${locale}`,
        role: 'user',
      },
    ],
  };
};
