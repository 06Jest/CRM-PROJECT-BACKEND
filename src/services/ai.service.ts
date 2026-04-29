import type {
  AIDashboardRequest,
  AIContactRequest,
  AIDealRequest,
  AIComposeRequest,
  AIChatRequest,
  AIChatMessage,
} from '../types/index';

async function callAI(
  systemPrompt: string,
  userMessage: string,
  history: AIChatMessage[] = []
): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'groq';

  if (provider === 'groq') {
    return callGroq(systemPrompt, userMessage, history);
  }

  if (provider === 'openai') {
    return callOpenAI(systemPrompt, userMessage, history);
  }

  throw new Error(`Unknown AI provider: ${provider}`);
}

async function callGroq(
  systemPrompt: string,
  userMessage: string,
  history: AIChatMessage[]
): Promise<string> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // fast, free Groq model
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content as string;
}

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  history: AIChatMessage[]
): Promise<string> {
  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // cost-effective production model
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content as string;
}

export const generateDashboardSummary = async (
  data: AIDashboardRequest
): Promise<string> => {
  const system = `You are a helpful CRM assistant. 
  Generate a concise, friendly daily summary for a sales team.
  Keep it under 100 words. Be specific with numbers.
  Use a professional but warm tone.`;

  const user = `Generate a dashboard summary for today:
  - Total contacts: ${data.totalContacts}
  - Total leads: ${data.totalLeads}
  - Total deals: ${data.totalDeals}
  - Revenue won: $${data.wonRevenue.toLocaleString()}
  - Recent activities (last 7 days): ${data.recentActivities}
  - Cold contacts (30+ days no activity): ${data.coldContacts}
  ${data.topCustomer ? `- Top customer: ${data.topCustomer}` : ''}`;

  return callAI(system, user);
}

 export const generateContactIntelligence = async (
  data: AIContactRequest
 ): Promise<string> => {
  const system = `You are a CRM sales coach. 
  Analyze contact data and give ONE specific, 
  actionable recommendation. Keep it under 80 words. 
  Include risk level: Low, Medium, or High.`;

  const user = `Analyze this contact:
  - Name: ${data.contactName}
  - Status: ${data.contactStatus}
  - Days since last contact: ${data.daysSinceLastContact}
  - Total activities: ${data.totalActivities}
  - Activity breakdown: ${JSON.stringify(data.activityTypes)}
  - Linked deals: ${data.linkedDeals}`;

  return callAI(system, user);
 }

 export const generateDealPrediction = async (
  data: AIDealRequest
 ): Promise<string> => {
  const system = `You are a sales analyst.
  Predict the win probability percentage for a deal and explain why.
  Format: Start with "Win probability: X%" then give a 2-sentence explanation.
  Keep total response under 80 words.`;

  const user = `Predict win probability for:
  - Deal: ${data.dealTitle}
  - Value: $${data.dealValue.toLocaleString()}
  - Stage: ${data.dealStage}
  - Days open: ${data.daysOpen}
  - Activities logged: ${data.activityCount}
  ${data.contactName ? `- Contact: ${data.contactName}` : ''}`;

  return callAI(system, user);
 }

 export const generateMessageDraft = async (
  data: AIComposeRequest
 ): Promise<string> => {
  const toneGuide = {
    formal: 'professional and formal',
    casual: 'friendly and conversational',
    followup: 'warm follow-up after previous contact',
  };
  const system = `You are a professional sales writer.
  Write a ${data.type === 'sms' ? 'short SMS (max 160 chars)' : 'concise email body'}.
  Tone: ${toneGuide[data.tone]}.
  ${data.type === 'email' ? 'Include a clear call to action.' : ''}
  Return ONLY the message content, no subject line, no labels.`;

  const user = `Write a ${data.type} for:
  - Contact: ${data.contactName}
  - Subject/Purpose: ${data.subject}
  ${data.context ? `- Additional context: ${data.context}` : ''}`;

  return callAI(system, user);
};

export const generateChatResponse = async (
  data: AIChatRequest
): Promise<string> => {
  const system = `You are MiniCRM's AI assistant.
  You help sales teams manage their CRM data and workflows.
  Be concise, helpful, and specific.
  Current CRM context:
  - Contacts: ${data.crmContext?.totalContacts || 0}
  - Leads: ${data.crmContext?.totalLeads || 0}
  - Deals: ${data.crmContext?.totalDeals || 0}`;

  return callAI(system, data.message, data.history);
};