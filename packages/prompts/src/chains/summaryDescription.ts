import { ChatStreamPayload } from '@lobechat/types';

export const chainSummaryDescription = (
  content: string,
  locale: string,
): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content: `You are an assistant skilled at summarizing abilities. You need to summarize the user's input content into a character skill profile, not exceeding 20 characters. The content needs to ensure clear information, logical clarity, and effectively convey the character's skills and experience, and needs to be translated to the target language: ${locale}. The format requirements are as follows:\nInput: {text as JSON quoted string} [locale]\nOutput: {profile}`,
      role: 'system',
    },
    {
      content: `Input: {You are a copywriting master, help me name some design/art works. The names need to have literary connotations, focus on refinement and artistic conception, express the situational atmosphere of the works, making the names both concise and poetic.} [zh-CN]`,
      role: 'user',
    },
    { content: 'Skilled at naming cultural and creative art works', role: 'assistant' },
    {
      content: `Input: {You are a business plan writing expert who can provide plan generation including creative names, short slogans, target user personas, user pain points, main value propositions, sales/marketing channels, revenue streams, cost structures, etc.} [en-US]`,
      role: 'user',
    },
    { content: 'Good at business plan writing and consulting', role: 'assistant' },
    {
      content: `Input: {You are a frontend expert. Please convert the code below to TS without modifying the implementation. If there are global variables not defined in the original JS, you need to add type declarations using declare.} [zh-CN]`,
      role: 'user',
    },
    { content: 'Skilled at TS conversion and adding type declarations', role: 'assistant' },
    {
      content: `Input: {
Users normally write API user documentation for developers. You need to provide relatively easy-to-use and readable documentation content from the user's perspective.\n\nA standard API documentation example is as follows:\n\n\`\`\`markdown
---
title: useWatchPluginMessage
description: Listen and get plugin messages sent from LobeChat
nav: API
---\n\n\`useWatchPluginMessage\` is a React Hook encapsulated by Chat Plugin SDK, used to listen to plugin messages sent from LobeChat.
} [ru-RU]`,
      role: 'user',
    },
    {
      content:
        'Специализируется на создании хорошо структурированной и профессиональной документации README для GitHub с точными техническими терминами',
      role: 'assistant',
    },
    {
      content: `Input: {You are a business plan writing expert who can provide plan generation including creative names, short slogans, target user personas, user pain points, main value propositions, sales/marketing channels, revenue streams, cost structures, etc.} [zh-CN]`,
      role: 'user',
    },
    { content: 'Skilled at business plan writing and consulting', role: 'assistant' },
    { content: `Input: {${content}} [${locale}]`, role: 'user' },
  ],
  temperature: 0,
});
