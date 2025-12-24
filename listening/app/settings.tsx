import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { FONTS } from "@/styles/hooks/_fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import Search from "@/components/Search";
import { baseUrl } from "@/app/utils/authFetch";

export default function Settings() {
  const router = useRouter();
  const [micAllowed, setMicAllowed] = useState<boolean>(false);

  const requestMicPermission = async (nextValue: boolean) => {
    try {
      if (nextValue) {
        const { granted } = await Audio.requestPermissionsAsync();
        setMicAllowed(granted);
        if (!granted) Alert.alert("권한 필요", "마이크 권한을 허용해주세요.");
      } else {
        // iOS/Android는 시스템 설정에서 권한 해제 필요. UI 상태만 끕니다.
        setMicAllowed(false);
        Alert.alert("알림", "마이크 권한은 기기 설정에서 변경할 수 있습니다.");
      }
    } catch (e) {
      Alert.alert("오류", "권한 처리 중 문제가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!refreshToken) {
        Alert.alert("오류", "저장된 리프레시 토큰이 없습니다.");
        return;
      }
      if (!accessToken) {
        Alert.alert("오류", "저장된 액세스 토큰이 없습니다.");
        return;
      }

      const body = { refreshToken };

      console.log("[logout][request]", body);

      const res = await fetch(`${baseUrl}/api/members/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          refreshToken: refreshToken,
        },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (_) {}

      console.log("[logout][response] status:", res.status, "json:", json);

      if (json?.isSuccess === true) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        Alert.alert("로그아웃", "정상적으로 로그아웃되었습니다.");
        router.push("/login");
      } else {
        Alert.alert("로그아웃 실패", json?.message || "다시 시도해주세요.");
      }
    } catch (e) {
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  const handleChangeNickname = async (nickname: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      const body = { nickname };
      console.log("[nickname][request]", body);

      const res = await fetch(`${baseUrl}/api/members/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (_) {}
      console.log("[nickname][response] status:", res.status, "json:", json);

      if (res.ok && json?.isSuccess !== false) {
        Alert.alert("완료", "닉네임이 변경되었습니다.");
      } else {
        Alert.alert("실패", json?.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (e) {
      Alert.alert("오류", "닉네임 변경 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="설정" leftIcon={true} rightIcon={false} />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>버전</Text>
            <Text style={styles.value}>v1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 제어</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>음성(마이크) 허용</Text>
            <Switch
              value={micAllowed}
              onValueChange={(v) => requestMicPermission(v)}
              trackColor={{ true: lightColors.sub1, false: lightColors.gray }}
              thumbColor={
                Platform.OS === "android" ? lightColors.white : undefined
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>닉네임 수정</Text>
          <Search
            placeholder="새 닉네임 입력"
            text="변경"
            onSend={handleChangeNickname}
          />
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.sub2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  section: {
    backgroundColor: lightColors.white,
    borderRadius: 12,
    padding: 16,
  },
  logoutSection: {
    marginTop: "auto",
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 26,
    color: lightColors.sub1,
    fontFamily: FONTS.SEMI_BOLD,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 24,
    color: lightColors.black,
    fontFamily: FONTS.MEDIUM,
  },
  value: {
    fontSize: 24,
    color: lightColors.gray,
    fontFamily: FONTS.MEDIUM,
  },
  logoutBtn: {
    backgroundColor: lightColors.red,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: lightColors.white,
    fontFamily: FONTS.SEMI_BOLD,
    fontSize: 26,
  },
});
