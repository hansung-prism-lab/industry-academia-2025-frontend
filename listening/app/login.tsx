import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FONTS } from "@/styles/hooks/_fonts";
import { lightColors } from "@/styles/hooks/_colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "@/app/utils/authFetch";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  data: {
    refreshToken: string;
    accessToken: string;
  };
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/members/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.isSuccess) {
        await AsyncStorage.setItem("accessToken", data.data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.data.refreshToken);
        router.push("/main");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="경청" leftIcon={false} rightIcon={false} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>로그인</Text>
          <View style={styles.inputContainer}>
            <Input
              label="이메일"
              placeholder="이메일을 입력해주세요."
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <Input
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요."
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
            />
          </View>
          <Button
            text="로그인"
            color={lightColors.white}
            backgroundColor={lightColors.main}
            onPress={handleLogin}
          />
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>아직 회원이 아니신가요?</Text>
            <Pressable
              onPress={() => {
                router.push("/signup");
              }}
            >
              <Text style={styles.signupText}>회원가입</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 38,
    marginTop: 40,
    marginBottom: 70,
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
