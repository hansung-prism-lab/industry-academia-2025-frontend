import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { baseUrl } from "@/app/utils/authFetch";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Search from "@/components/Search";
import Button from "@/components/Button";
import { FONTS } from "@/styles/hooks/_fonts";
import { lightColors } from "@/styles/hooks/_colors";
import { useRouter } from "expo-router";
import { useState } from "react";

interface SignupData {
  nickname: string;
  email: string;
  password: string;
}

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupData>({
    nickname: "",
    email: "",
    password: "",
  });

  const handleEmailCheck = async () => {
    try {
      if (!formData.email) return;
      const body = { email: formData.email };
      // 1) 이메일 중복 검사
      console.log("[email-check][request] POST", body);
      const checkRes = await fetch(`${baseUrl}/api/members/email-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      let checkJson: any = null;
      try {
        checkJson = await checkRes.json();
      } catch {}
      console.log(
        "[email-check][response] status:",
        checkRes.status,
        "json:",
        checkJson
      );
      if (!checkRes.ok || checkJson?.isSuccess === false) {
        Alert.alert(
          "실패",
          checkJson?.message || "이미 사용 중인 이메일입니다."
        );
        return;
      }

      // 2) 인증번호 전송
      console.log("[email-send][request] POST", body);
      const res = await fetch(
        `${baseUrl}/api/members/email-verification/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      let json: any = null;
      try {
        json = await res.json();
      } catch {}
      console.log("[email-send][response] status:", res.status, "json:", json);
      if (res.ok && json?.isSuccess !== false) {
        Alert.alert("완료", "인증번호가 발송되었습니다.");
      } else {
        Alert.alert("실패", json?.message || "인증번호 발송에 실패했습니다.");
      }
    } catch (e) {
      console.error("[email-send] error:", e);
      Alert.alert("오류", "인증번호 발송 중 문제가 발생했습니다.");
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      if (!formData.email || !code) return;
      const body = { email: formData.email, code };
      console.log("[email-verify][request] POST", body);
      const res = await fetch(
        `${baseUrl}/api/members/email-verification/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      let json: any = null;
      try {
        json = await res.json();
      } catch {}
      console.log(
        "[email-verify][response] status:",
        res.status,
        "json:",
        json
      );
      if (res.ok && json?.isSuccess !== false) {
        Alert.alert("완료", "이메일 인증이 확인되었습니다.");
      } else {
        Alert.alert("실패", json?.data || "인증번호 확인에 실패했습니다.");
      }
    } catch (e) {
      console.error("[email-verify] error:", e);
      Alert.alert("오류", "인증 확인 중 문제가 발생했습니다.");
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/members/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("회원가입 성공");
        router.push("/login");
      } else {
        console.error("회원가입 실패:", await response.text());
      }
    } catch (error) {
      console.error("API 요청 오류:", error);
    }
  };
  return (
    <SafeAreaView>
      <Header title="경청" leftIcon={false} rightIcon={false} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>회원가입</Text>
        <View style={styles.inputContainer}>
          <Input
            label="닉네임"
            placeholder="닉네임을 입력해주세요."
            value={formData.nickname}
            onChangeText={(text) =>
              setFormData({ ...formData, nickname: text })
            }
          />
          <Input
            label="이메일"
            placeholder="이메일을 입력해주세요."
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          <Pressable style={styles.emailSendButton} onPress={handleEmailCheck}>
            <Text style={styles.emailSendText}>인증번호 전송</Text>
          </Pressable>
          <Search placeholder="000000" text="확인" onSend={handleVerifyCode} />
          <Input
            label="비밀번호"
            placeholder="영어, 숫자 포함 8~12자"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            secureTextEntry
          />
          <Input
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해주세요."
            secureTextEntry
          />
        </View>
        <Button
          text="회원가입"
          color={lightColors.white}
          backgroundColor={lightColors.main}
          onPress={handleSignup}
        />
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>이미 회원이신가요?</Text>
          <Pressable
            onPress={() => {
              router.push("/login");
            }}
          >
            <Text style={styles.signupText}>로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 115,
    paddingHorizontal: 36,
    backgroundColor: lightColors.sub2,
  },
  title: {
    fontSize: 60,
    fontFamily: FONTS.BLACK,
    color: lightColors.sub1,
  },
  inputContainer: {
    width: "100%",
    gap: 25,
    marginTop: 40,
    marginBottom: 70,
  },
  emailSendButton: {
    width: "100%",
    padding: 9,
    borderRadius: 44,
    alignItems: "center",
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    elevation: 10,
    backgroundColor: lightColors.main,
  },
  emailSendText: {
    fontSize: 26,
    fontFamily: FONTS.SEMI_BOLD,
    color: lightColors.white,
  },
  bottomContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
  },
  bottomText: {
    fontSize: 22,
    fontFamily: FONTS.REGULAR,
    color: lightColors.gray,
  },
  signupText: {
    fontSize: 22,
    fontFamily: FONTS.SEMI_BOLD,
    color: lightColors.sub1,
    textDecorationLine: "underline",
  },
});
