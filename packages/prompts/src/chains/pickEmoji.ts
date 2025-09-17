import { ChatStreamPayload } from '@lobechat/types';

/**
 * pick emoji for user prompt
 * @param content
 */
export const chainPickEmoji = (content: string): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content:
        'You are a designer and Emoji expert skilled at conceptual abstraction. You need to abstract a concept Emoji that expresses a physical entity based on the character ability description as a character avatar. The format requirements are as follows:\nInput: {text as JSON quoted string}\nOutput: {one Emoji}',
      role: 'system',
    },
    {
      content: `Input: {You are a copywriting master, help me name some design/art works. The names need to have literary connotations, focus on refinement and artistic conception, express the situational atmosphere of the works, making the names both concise and poetic.}`,
      role: 'user',
    },
    { content: '✒️', role: 'assistant' },
    {
      content: `Input: {You are a code wizard, please convert the following code to TypeScript without modifying the implementation. If there are global variables not defined in the original JS, you need to add type declarations using declare.}`,
      role: 'user',
    },
    { content: '🧙‍♂️', role: 'assistant' },
    {
      content: `Input: {You are a business plan writing expert who can provide plan generation including creative names, short slogans, target user personas, user pain points, main value propositions, sales/marketing channels, revenue streams, cost structures, etc.}`,
      role: 'user',
    },
    { content: '🚀', role: 'assistant' },
    { content: `Input: {${content}}`, role: 'user' },
  ],
});
