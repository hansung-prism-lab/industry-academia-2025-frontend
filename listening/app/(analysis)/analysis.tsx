import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { MicWhiteIcon, StopIcon } from "@/components/icon";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Waveform } from "@/components/Waveform";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch, baseUrl } from "@/app/utils/authFetch";

const script = ["나는 가방을 메고 학교에 갑니다"];

export default function Analysis() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const hasNavigatedRef = useRef(false);

  const uploadAudio = useCallback(
    async (fileUri: string) => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        // 서버 헬스체크 (GET)
        try {
          const healthRes = await authFetch(
            `${baseUrl}/api/diagnoses/health-check`,
            { method: "GET" }
          );
          let healthPayload: any = null;
          try {
            healthPayload = await healthRes.json();
          } catch {
            healthPayload = await healthRes.text();
          }
          console.log("[diagnose][health] status:", healthRes.status);
          console.log("[diagnose][health] body:", healthPayload);
        } catch (healthErr) {
          console.log("[diagnose][health] error:", healthErr);
        }

        // 파일 확장자 및 MIME 타입을 URI 기반으로 동적으로 설정 (chat.tsx와 동일)
        const extMatch = fileUri.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch
          ? extMatch[1].toLowerCase()
          : Platform.OS === "ios"
          ? "caf"
          : "m4a";
        const fileName = `recording-${Date.now()}.${ext}`;
        const mimeType =
          ext === "m4a"
            ? "audio/m4a"
            : ext === "caf"
            ? "audio/x-caf"
            : ext === "wav"
            ? "audio/wav"
            : ext === "mp3"
            ? "audio/mpeg"
            : "audio/*";

        const formData = new FormData();
        formData.append("audio", {
          uri: fileUri,
          type: mimeType,
          name: fileName,
        } as any);

        // Request 로그
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          const size =
            fileInfo.exists && "size" in fileInfo
              ? (fileInfo as any).size
              : undefined;
          console.log(
            "[diagnose][request] url:",
            `${baseUrl}/api/diagnoses/diagnose`
          );
          console.log("[diagnose][request] method:", "POST");
          console.log("[diagnose][request] headers:", {
            Authorization: accessToken
              ? `Bearer ${accessToken.slice(0, 10)}...`
              : "<none>",
            "Content-Type": "multipart/form-data",
          });
          console.log("[diagnose][request] file:", {
            uri: fileUri,
            type: mimeType,
            name: fileName,
            size,
            exists: fileInfo?.exists,
          });
        } catch (logErr) {
          console.log("[diagnose][request] log error:", logErr);
        }

        const res = await authFetch(`${baseUrl}/api/diagnoses/diagnose`, {
          method: "POST",
          body: formData,
          headers: {
            // multipart/form-data의 경우 브라우저가 boundary를 자동으로 설정하도록 비움 (chat.tsx와 동일)
          },
        });

        let payload: any = null;
        try {
          payload = await res.json();
        } catch {
          // JSON이 아니면 무시
        }

        console.log("[diagnose] status:", res.status);
        console.log("[diagnose] json:", payload?.data?.propList);

        // 성공/실패 결과 화면으로 이동 (HTTP 오류도 실패 처리)
        const success = res.ok && payload?.isSuccess === true;
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          if (success) {
            router.push({
              pathname: "/analysis-result",
              params: {
                title: "분석 성공",
                description: `음성 분석이\n완료되었습니다.`,
                buttonText: "결과 보러가기",
                propList: JSON.stringify(payload?.data?.propList ?? []),
                nickname: payload?.data?.member?.nickname ?? "",
              },
            });
          } else {
            router.push({
              pathname: "/analysis-result",
              params: {
                title: "분석 실패",
                description: `음성 분석에\n실패했습니다.`,
                buttonText: "다시 시도하기",
              },
            });
          }
        }
      } catch (e) {
        console.error("[diagnose] upload error:", e);
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          router.push({
            pathname: "/analysis-result",
            params: {
              title: "분석 실패",
              description: `음성 분석에\n실패했습니다.`,
              buttonText: "다시 시도하기",
            },
          });
        }
      }
    },
    [router]
  );

  const stopRecording = useCallback(async () => {
    try {
      if (recordingStatus === "recording" && recording) {
        console.log("Stopping Recording");
        try {
          await recording.stopAndUnloadAsync();
        } catch (unloadError) {
          console.log("Recording already unloaded:", unloadError);
        }
        const recordingUri = recording.getURI();

        if (!recordingUri) {
          console.log("No recording URI found");
          return;
        }

        // chat.tsx와 동일하게 원본 파일 URI 사용 + 존재 보장 루프
        const sourceUri = recordingUri;
        let existsInfo = await FileSystem.getInfoAsync(sourceUri);
        for (let i = 0; i < 3 && !existsInfo.exists; i++) {
          await new Promise((r) => setTimeout(r, 120));
          existsInfo = await FileSystem.getInfoAsync(sourceUri);
        }
        if (!existsInfo.exists) {
          console.log("Recorded file not found:", sourceUri);
          return;
        }

        // 업로드 호출 (원본 URI 전달)
        uploadAudio(sourceUri);

        // 상태 초기화
        setRecording(null);
        setRecordingStatus("stopped");

        // 다음 스크립트로 이동 (결과 화면 이동은 업로드 응답에서만 처리)
        if (currentScriptIndex < script.length - 1) {
          setCurrentScriptIndex(currentScriptIndex + 1);
        }

        return sourceUri;
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }, [recording, recordingStatus, currentScriptIndex, uploadAudio]);

  useEffect(() => {
    // 녹음 및 미디어 라이브러리 권한 요청
    async function getPermissions() {
      try {
        // 오디오 녹음 권한
        const audioPermission = await Audio.requestPermissionsAsync();
        console.log("Audio Permission Granted: " + audioPermission.granted);
        setAudioPermission(audioPermission.granted);
      } catch (error) {
        console.log("Permission error:", error);
      }
    }
    getPermissions();
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, [recording, stopRecording]);

  async function startRecording() {
    try {
      // IoS 녹음 권한 설정
      if (audioPermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const newRecording = new Audio.Recording();
      console.log("Starting Recording");
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }
  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording();
      if (audioUri) {
        console.log("Saved audio file to", audioUri);
      }
    } else {
      await startRecording();
    }
  }

  return (
    <View style={styles.container}>
      <Header title="간이 진단" leftIcon={true} rightIcon={false} />
      <View style={styles.content}>
        <Text style={styles.title}>간이 진단</Text>
        <Text style={styles.subtitle}>
          녹음 버튼을 누르신 후,{"\n"}
          다음과 같이 말씀해보세요.
        </Text>
        <View style={styles.scriptContainer}>
          <Text style={styles.script}>{script[currentScriptIndex]}</Text>
        </View>
        {/* <Text style={styles.scriptCount}>
          {currentScriptIndex + 1}/{script.length}
        </Text> */}
        <View style={styles.voiceWave}>
          <Waveform
            style={{ flex: 1 }}
            waveColor={lightColors.sub1}
            active={recordingStatus === "recording"}
          />
        </View>
        <Pressable style={styles.button} onPress={handleRecordButtonPress}>
          {recording ? <StopIcon /> : <MicWhiteIcon />}
        </Pressable>
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
    paddingHorizontal: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 60,
    fontFamily: FONTS.BLACK,
    color: lightColors.sub1,
  },
  subtitle: {
    lineHeight: 54.4,
    marginTop: 21,
    fontSize: 32,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.black,
    textAlign: "center",
  },
  scriptContainer: {
    marginTop: 29,
    backgroundColor: lightColors.white,
    borderRadius: 10,
    paddingVertical: 23,
    width: "100%",
    marginHorizontal: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: lightColors.sub1,
  },
  script: {
    lineHeight: 54.4,
    fontSize: 32,
    fontFamily: FONTS.BOLD,
    color: lightColors.black,
    textAlign: "center",
  },
  scriptCount: {
    lineHeight: 54.4,
    fontSize: 32,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.sub1,
    textAlign: "center",
  },
  voiceWave: {
    width: "100%",
    height: 80,
    marginTop: 5,
    marginBottom: 5,
  },
  button: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightColors.main,
    borderRadius: "50%",
  },
});
