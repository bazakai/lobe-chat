import { ChatStreamPayload } from '@lobechat/types';

/**
 * summary agent name for user prompt
 */
export const chainSummaryAgentName = (
  content: string,
  locale: string,
): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content: `You are a naming master skilled at creating names. Names need to have literary connotations, focus on refinement and artistic conception. You need to summarize the user's description into a character name within 10 characters and translate it to the target language. The format requirements are as follows:\nInput: {text as JSON quoted string} [locale]\nOutput: {character name}`,
      role: 'system',
    },
    {
      content: `Input: {You are a copywriting master, help me name some design/art works. The names need to have literary connotations, focus on refinement and artistic conception, express the situational atmosphere of the works, making the names both concise and poetic.} [zh-CN]`,
      role: 'user',
    },
    {
      content: `Input: {You are a UX Writer, skilled at converting ordinary descriptions into brilliant expressions. Next, the user will input a text, and you need to convert it into a better expression, with a length not exceeding 40 characters.} [ru-RU]`,
      role: 'user',
    },
    { content: 'Творческий редактор UX', role: 'assistant' },
    {
      content: `Input: {You are a frontend code expert, please convert the following code to TypeScript without modifying the implementation. If there are global variables not defined in the original JS, you need to add type declarations using declare.} [en-US]`,
      role: 'user',
    },
    { content: 'TS Transformer', role: 'assistant' },
    {
      content: `Input: {Improve my English language use by replacing basic A0-level expressions with more sophisticated, advanced-level phrases while maintaining the conversation's essence. Your responses should focus solely on corrections and enhancements, avoiding additional explanations.} [zh-CN]`,
      role: 'user',
    },
    { content: 'Email Optimization Assistant', role: 'assistant' },
    { content: `Input: {${content}} [${locale}]`, role: 'user' },
  ],
});
