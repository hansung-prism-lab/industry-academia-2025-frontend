import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { MicWhiteIcon, StopIcon } from "@/components/icon";
import { useState, useEffect, useCallback, useRef } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch, baseUrl } from "@/app/utils/authFetch";

interface ConversionResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  data: {
    success: boolean;
    text: string;
    filename: string;
    s3Url: string;
    createdAt: string | null;
    member: {
      id: number;
      email: string;
      nickname: string;
    };
  };
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  status: "error" | "success";
}

export default function Chat() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   id: "1",
    //   text: "움직이기 불편한데 저것 좀 가져다줘.",
    //   timestamp: "16:00",
    //   status: "error",
    // },
    // {
    //   id: "2",
    //   text: "머리야파.",
    //   timestamp: "16:07",
    //   status: "success",
    // },
  ]);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "recording" | "stopping" | "stopped"
  >("idle");
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);

  const stopRecording = useCallback(async () => {
    try {
      // 이미 중지 중이거나 중지된 상태면 무시
      if (recordingStatus === "stopping" || recordingStatus === "stopped") {
        return;
      }

      if (recordingStatus === "recording" && recording) {
        setRecordingStatus("stopping");
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

        // 원본 파일을 그대로 사용 (복사 제거)
        const sourceUri = recordingUri;

        // 파일 존재 보장 (안드로이드에서 stop 직후 지연 문제 대응)
        let existsInfo = await FileSystem.getInfoAsync(sourceUri);
        for (let i = 0; i < 3 && !existsInfo.exists; i++) {
          await new Promise((r) => setTimeout(r, 120));
          existsInfo = await FileSystem.getInfoAsync(sourceUri);
        }
        if (!existsInfo.exists) {
          console.log("Recorded file not found:", sourceUri);
          return;
        }

        // 파일명/확장자 추출
        const extMatch = sourceUri.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch
          ? extMatch[1].toLowerCase()
          : Platform.OS === "ios"
          ? "caf"
          : "m4a";
        const fileName = `recording-${Date.now()}.${ext}`;

        // 서버로 음성 파일 전송
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        // 파일 확장자 기반 올바른 MIME 타입 설정
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
          uri: sourceUri,
          type: mimeType,
          name: fileName,
        } as any);

        // 헬스체크 (GET)
        try {
          const healthRes = await authFetch(
            `${baseUrl}/api/conversions/health-check`,
            { method: "GET" }
          );
          let healthBody: any = null;
          try {
            healthBody = await healthRes.json();
          } catch {
            healthBody = await healthRes.text();
          }
          console.log("[convert][health] status:", healthRes.status);
          console.log("[convert][health] body:", healthBody);
        } catch (healthErr) {
          console.log("[convert][health] error:", healthErr);
        }

        // 요청 로그
        try {
          const info = await FileSystem.getInfoAsync(sourceUri);
          const size =
            info.exists && "size" in info ? (info as any).size : undefined;
          console.log(
            "[convert][request] url:",
            `${baseUrl}/api/conversions/convert`
          );
          console.log("[convert][request] method:", "POST");
          console.log("[convert][request] headers:", {
            Authorization: `Bearer ${token.slice(0, 10)}...`,
            "Content-Type": "multipart/form-data",
          });
          console.log("[convert][request] file:", {
            uri: sourceUri,
            type: mimeType,
            name: fileName,
            size,
            exists: info?.exists,
          });
        } catch (logErr) {
          console.log("[convert][request] log error:", logErr);
        }

        const response = await authFetch(`${baseUrl}/api/conversions/convert`, {
          method: "POST",
          body: formData,
          // Content-Type 헤더를 명시적으로 제거하여 브라우저가 자동으로 설정하도록 함
          headers: {
            // multipart/form-data의 경우 브라우저가 자동으로 boundary를 포함한 Content-Type을 설정
          },
        });

        let result: ConversionResponse;
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error("JSON 파싱 에러:", jsonError);
          const textResponse = await response.text();
          console.error("서버 응답 텍스트:", textResponse);
          result = {
            isSuccess: false,
            code: "PARSE_ERROR",
            message: "서버 응답을 파싱할 수 없습니다.",
            data: {
              success: false,
              text: "음성 변환에 실패했습니다.",
              filename: "",
              s3Url: "",
              createdAt: null,
              member: { id: 0, email: "", nickname: "" },
            },
          };
        }

        console.log("API Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          result,
        });

        // 상태 초기화
        setRecording(null);
        setRecordingStatus("stopped");

        // 새 메시지 추가 (중복 방지를 위해 ID 체크)
        const messageId = Date.now().toString();
        const newMessage: Message = {
          id: messageId,
          text: result.isSuccess
            ? result.data.text
            : `음성 변환에 실패했습니다. (${
                result.message || "알 수 없는 오류"
              })`,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          status: result.isSuccess ? "success" : "error",
        };

        setMessages((prev) => {
          // 이미 같은 ID의 메시지가 있는지 확인
          const isDuplicate = prev.some((msg) => msg.id === messageId);
          if (isDuplicate) {
            return prev;
          }
          return [...prev, newMessage];
        });

        return sourceUri;
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }, [recording, recordingStatus]);

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
      // cleanup에서는 녹음 상태만 초기화
      if (recording && recordingStatus === "recording") {
        setRecordingStatus("stopped");
        setRecording(null);
      }
    };
  }, [recording, recordingStatus]);

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
      // 녹음 중지 중에는 버튼 비활성화
      if (recordingStatus === "stopping") return;
      setRecordingStatus("stopping");

      const audioUri = await stopRecording();
      if (audioUri) {
        console.log("Saved audio file to", audioUri);
      }
    } else {
      await startRecording();
    }
  }

  const formatDate = () => {
    const date = new Date();
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .slice(0, -1);
  };

  return (
    <View style={styles.container}>
      <Header title="텍스트 변환" leftIcon={true} rightIcon={false} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        <Text style={styles.dateText}>{formatDate()}</Text>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageRow}>
            <View
              style={[
                styles.messageContainer,
                message.status === "error"
                  ? styles.errorMessage
                  : styles.successMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.timestampText}>{message.timestamp}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomContainer}>
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
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 160, // 마이크 버튼 영역 + 추가 여백
  },
  dateText: {
    textAlign: "center",
    fontSize: 16,
    color: lightColors.gray,
    marginBottom: 20,
    fontFamily: FONTS.MEDIUM,
  },
  messageRow: {
    marginBottom: 10,
    alignItems: "center",
  },
  messageContainer: {
    padding: 15,
    borderRadius: 15,
    width: "80%",
  },
  errorMessage: {
    backgroundColor: "rgba(251, 65, 65, 0.3)",
    borderWidth: 3,
    borderColor: lightColors.red,
  },
  successMessage: {
    backgroundColor: "rgba(92, 179, 56, 0.3)",
    borderWidth: 3,
    borderColor: lightColors.green,
  },
  messageText: {
    fontSize: 24,
    color: lightColors.black,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 5,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 5,
  },
  timestampText: {
    fontSize: 18,
    color: lightColors.sub1,
    fontFamily: FONTS.MEDIUM,
  },
  errorIcon: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomContainer: {
    padding: 20,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  button: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightColors.main,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
