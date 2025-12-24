import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl as API_BASE_URL } from '@/app/utils/authFetch';

// Simple UUID v4 generator (RFC4122-ish) without external deps
function uuidv4() {
  // eslint-disable-next-line no-bitwise
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SESSION_KEY = 'chat_session_id';
let currentSessionId: string | undefined = undefined;

export function getSessionId() {
  return currentSessionId;
}

export type AgentAction = 'web_search' | 'call_phone' | 'send_sms' | 'chat';

export interface AgentResponse {
  ok: boolean;
  action: AgentAction;
  params: Record<string, any>;
  reply: string;
  need_clarification: boolean;
  missing: string | null;
  use_rag: boolean;
  session_id?: string;
}

interface ApiEnvelope {
  isSuccess: boolean;
  code: string;
  message: string;
  data: {
    message: string;
    action: AgentAction;
    params: Record<string, any>;
    useRag: boolean;
    sessionId?: string;
  };
}

export async function sendUserMessage(message: string, signal?: AbortSignal): Promise<AgentResponse> {
  try {
    // 토큰 확인
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인 후 다시 시도해 주세요.');
    }

    // 요청 바디 (명세 준수: message만 전송)
    const payload = { message };

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[chatApi] POST /api/agents/chat', { url: `${API_BASE_URL}/api/agents/chat`, payload });
    }
    const res = await fetch(`${API_BASE_URL}/api/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }

    const env = (await res.json()) as ApiEnvelope;
    if (!env.isSuccess) {
      throw new Error(env.message || '요청에 실패했습니다.');
    }

    // params 정규화: target -> name
    const normalizedParams = { ...env.data.params };
    if (typeof normalizedParams.target === 'string' && !normalizedParams.name) {
      normalizedParams.name = normalizedParams.target;
    }

    // 세션 보관(서버가 내려준 경우)
    if (env.data.sessionId) {
      currentSessionId = env.data.sessionId;
    }

    const result: AgentResponse = {
      ok: env.isSuccess,
      action: env.data.action,
      params: normalizedParams,
      reply: env.data.message,
      need_clarification: false,
      missing: null,
      use_rag: !!env.data.useRag,
      session_id: env.data.sessionId,
    };
    return result;
  } catch (err) {
    throw new Error(`Network error calling ${API_BASE_URL}/api/agents/chat: ${String(err)}`);
  }
}

// Since the backend responds with the full reply text, we create a client-side stream effect
export async function* streamText(text: string, cps = 30, signal?: AbortSignal) {
  // characters per step; yield chunks for smoother rendering
  let i = 0;
  const delay = 33; // ~30fps
  while (i < text.length) {
    if (signal?.aborted) return;
    const next = Math.max(1, Math.round(cps / 2));
    const slice = text.slice(i, i + next);
    i += next;
    yield slice;
    await new Promise((r) => setTimeout(r, delay));
  }
}
