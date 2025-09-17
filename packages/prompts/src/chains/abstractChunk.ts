import { ChatStreamPayload } from '@lobechat/types';

export const chainAbstractChunkText = (text: string): Partial<ChatStreamPayload> => {
  return {
    messages: [
      {
        content:
          "You are an assistant skilled at extracting summaries from chunks. You need to summarize the user's conversation into a 1-2 sentence summary, outputting in the language used by the chunk",
        role: 'system',
      },
      {
        content: `chunk: ${text}`,
        role: 'user',
      },
    ],
  };
};
