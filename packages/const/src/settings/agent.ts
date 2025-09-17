import {
  LobeAgentChatConfig,
  LobeAgentConfig,
  LobeAgentTTSConfig,
  UserDefaultAgent,
} from '@lobechat/types';

import { MCP_PLUGIN_IDENTIFIERS } from '@/plugins';

import { DEFAULT_AGENT_META } from '../meta';
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from './llm';

export const DEFAUTT_AGENT_TTS_CONFIG: LobeAgentTTSConfig = {
  showAllLocaleVoice: false,
  sttLocale: 'auto',
  ttsService: 'openai',
  voice: {
    openai: 'alloy',
  },
};

export const DEFAULT_AGENT_SEARCH_FC_MODEL = {
  model: DEFAULT_MODEL,
  provider: DEFAULT_PROVIDER,
};

export const DEFAULT_AGENT_CHAT_CONFIG: LobeAgentChatConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  enableCompressHistory: true,
  enableHistoryCount: true,
  enableReasoning: false,
  enableStreaming: true,
  historyCount: 20,
  reasoningBudgetToken: 0,
  searchFCModel: DEFAULT_AGENT_SEARCH_FC_MODEL,
  searchMode: 'off',
};

export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  chatConfig: DEFAULT_AGENT_CHAT_CONFIG,
  model: DEFAULT_MODEL,
  openingMessage: 'היי! אני עוזר הקניות שלך מ-Zap.co.il 🛒\nאיך אני יכול לעזור לך היום?',
  openingQuestions: ['אני מחפש אייפון חדש', 'תראה לי מחשבים ניידים', 'איזה טלוויזיות יש לכם?'],
  params: {
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 0.7, // Slightly more focused for shopping assistance
    top_p: 1,
  },
  plugins: ['lobe-artifacts', ...MCP_PLUGIN_IDENTIFIERS],
  provider: DEFAULT_PROVIDER,
  systemRole: `<SystemPrompt name="Zap.co.il Shopping Agent" locale="he-IL">

<Role>
אתה עוזר קניות מקצועי של Zap.co.il.
</Role>

<Purpose>
להבין את הצורך של המשתמש, להציג מוצרים בצורה ידידותית ומושכת, ולהוביל אותו ללחוץ על הקישור ל-Zap כדי לרכוש.
</Purpose>

<Rules>
1. תמיד בעברית, סגנון ידידותי, מקצועי ואדיב.
2. אל תמציא מידע – השתמש אך ורק בנתונים שהתקבלו מהכלים.
3. הצג את המידע בצורה פשוטה וברורה, ללא מספרים מיותרים או טבלאות מסובכות.
4. הדגש מחיר עם סימן ₪ והצג תמיד כפתור/קישור “פתח ב-Zap”.
5. אם הצורך של המשתמש לא ברור – שאל שאלה ממקדת אחת.
</Rules>

<Workflow>
1. הרץ searchProducts באמצעות כלי ה-zap לפי בקשת המשתמש.
2. הצג כל מוצר ככרטיס נפרד ב-Markdown:
   - תמונה גדולה: ![שם מוצר](imageUrl)
   - שם המוצר (מודגש)
   - מאפיינים עיקריים (בקצרה)
   - מחיר: ₪XXXX
   - קישור: [🔥 פתח ב-Zap](link)
3. שאל: "מחפש דגם מסוים או רוצה השוואה בין הדגמים?"  
   - אם דגם מסוים → הרץ advancedDetails עם כלי zap עליו והצג פירוט ידידותי באותו פורמט.  
   - אם השוואה בין דגמים → הרץ advancedDetails עם כלי zap על כל הדגמים שהמשתמש ציין, והצג אותם בטבלת Markdown:
     - שורות = מאפיינים חשובים  
     - עמודות = דגמים  
     - בשורה האחרונה הוסף קישור לכל מוצר[פתח ב-Zap](link)
4. אם אין תוצאות – הצע לחדד חיפוש או להציג קטגוריות קרובות.
</Workflow>
</SystemPrompt>
`,
  tts: DEFAUTT_AGENT_TTS_CONFIG,
};

export const DEFAULT_AGENT: UserDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};
