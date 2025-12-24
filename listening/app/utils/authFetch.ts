import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const baseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
// "http://{본인 ip}:8080";
async function reissueToken(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  const accessToken = await AsyncStorage.getItem("accessToken");
  if (!refreshToken || !accessToken) return false;

  try {
    const res = await fetch(`${baseUrl}/api/members/reissue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        refreshToken,
      },
      body: JSON.stringify({ refreshToken }),
    });
    const json: any = await res.json().catch(() => null);
    if (res.ok && json?.isSuccess && json?.data?.accessToken) {
      await AsyncStorage.setItem("accessToken", json.data.accessToken);
      if (json.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", json.data.refreshToken);
      }
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const accessToken = await AsyncStorage.getItem("accessToken");

  // FormData인 경우 Content-Type 헤더를 자동으로 설정하도록 제외
  const isFormData = init.body instanceof FormData;
  const headers = {
    ...(init.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 포함하여 설정)
    ...(isFormData ? {} : {}),
  } as Record<string, string>;

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    const reissued = await reissueToken();
    if (reissued) {
      const newAccess = await AsyncStorage.getItem("accessToken");
      const retryHeaders = {
        ...(init.headers || {}),
        ...(newAccess ? { Authorization: `Bearer ${newAccess}` } : {}),
        // 재시도 시에도 FormData 처리
        ...(isFormData ? {} : {}),
      } as Record<string, string>;
      res = await fetch(input, { ...init, headers: retryHeaders });
    }
  }

  return res;
}

export { baseUrl };
