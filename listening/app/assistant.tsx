import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { MicWhiteIcon, StopIcon } from "@/components/icon";
import { useState, useEffect, useCallback, useRef } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import Search from "@/components/Search";
import {
  openWebSearch,
  callPhoneByName,
  sendSmsByName,
} from "@/lib/nativeActions";
import { authFetch, baseUrl } from "@/app/utils/authFetch";

// (unused)

interface Message {
  text: string;
  isUser: boolean;
  audioUrl?: string;
}

// 로컬 스트리밍 유틸 (텍스트 타자 효과)
async function* streamTextLocal(text: string, cps = 30, signal?: AbortSignal) {
  let i = 0;
  const delay = 33;
  while (i < text.length) {
    if (signal?.aborted) return;
    const next = Math.max(1, Math.round(cps / 2));
    const slice = text.slice(i, i + next);
    i += next;
    yield slice;
    await new Promise((r) => setTimeout(r, delay));
  }
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    // { text: "아들에게 전화 걸어줘.", isUser: true },
    // { text: "네, 아들에게 전화 걸겠습니다.", isUser: false },
  ]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const appendMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
  };

  // 로컬 파일 확장자 기반 mime type 추정
  const guessMimeType = (uri: string): string => {
    const name = uri.split("/").pop() ?? "recording.m4a";
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "caf":
        return "audio/x-caf";
      case "m4a":
        return "audio/m4a";
      case "wav":
        return "audio/wav";
      case "mp3":
        return "audio/mpeg";
      default:
        return "audio/*";
    }
  };

  // 음성 파일 업로드하여 텍스트 변환
  const transcribeVoice = useCallback(
    async (uri: string): Promise<string | null> => {
      try {
        const name = uri.split("/").pop() ?? `recording-${Date.now()}.m4a`;
        const type = guessMimeType(uri);

        const form = new FormData();
        form.append("audio", { uri, name, type } as any);

        const res = await authFetch(`${baseUrl}/api/agents/convert`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          appendMessage({
            text: `음성 인식 실패: ${res.status} ${res.statusText}`,
            isUser: false,
          });
          return null;
        }

        const json: any = await res.json().catch(() => null);
        if (!json) return null;

        if (json?.isSuccess === false) {
          appendMessage({
            text: String(json?.message ?? "음성 인식 실패"),
            isUser: false,
          });
          return null;
        }

        const data = json?.data ?? {};
        const transcript =
          (typeof data === "string" ? data : data?.text || data?.message) ||
          json?.text ||
          json?.message ||
          "";

        return transcript ? String(transcript) : null;
      } catch (e) {
        appendMessage({
          text: `음성 업로드 오류: ${String(e)}`,
          isUser: false,
        });
        return null;
      }
    },
    []
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

        const fileExtension = Platform.OS === "ios" ? "caf" : "m4a";
        const fileName = `recording-${Date.now()}.${fileExtension}`;

        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "recordings/",
          { intermediates: true }
        );
        const savedUri =
          FileSystem.documentDirectory + "recordings/" + fileName;

        await FileSystem.copyAsync({
          from: recordingUri,
          to: savedUri,
        });
        console.log("File saved to:", savedUri);

        // const playbackObject = new Audio.Sound();
        // await playbackObject.loadAsync({ uri: savedUri });
        // await playbackObject.playAsync();

        setRecording(null);
        setRecordingStatus("stopped");

        return savedUri;
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }, [recording, recordingStatus]);

  const handleTextSubmit = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 사용자 메시지 표시
    appendMessage({ text: trimmed, isUser: true });
    setQuery("");

    try {
      // 명세: Authorization 헤더 + { message }
      const res = await authFetch(`${baseUrl}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        appendMessage({
          text: `요청 실패: ${res.status} ${res.statusText}`,
          isUser: false,
        });
        return;
      }

      const env: any = await res.json();
      if (!env?.isSuccess) {
        appendMessage({
          text: String(env?.message ?? "요청 실패"),
          isUser: false,
        });
        return;
      }

      const data = env.data ?? {};
      const reply: string = String(data.message ?? "");
      const action: string = String(data.action ?? "chat");
      const params: Record<string, any> = data.params ?? {};

      // 어시스턴트 자리 생성 후 스트리밍
      appendMessage({ text: "", isUser: false });
      let acc = "";
      for await (const chunk of streamTextLocal(reply, 30)) {
        acc += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (!copy[i].isUser) {
              copy[i] = { ...copy[i], text: acc };
              break;
            }
          }
          return copy;
        });
      }

      // 액션 수행
      try {
        switch (action) {
          case "web_search": {
            const q = String(params?.query ?? trimmed);
            await openWebSearch(q);
            break;
          }
          case "call_phone": {
            const name = String(params?.name ?? params?.target ?? "");
            if (name) await callPhoneByName(name);
            break;
          }
          case "send_sms": {
            const name = String(params?.name ?? params?.target ?? "");
            const msg = String(params?.message ?? "");
            if (name && msg) await sendSmsByName(name, msg);
            break;
          }
          default:
            break;
        }
      } catch (actionErr) {
        appendMessage({
          text: `액션 실패: ${String(actionErr)}`,
          isUser: false,
        });
      }
    } catch (err) {
      appendMessage({ text: `네트워크 오류: ${String(err)}`, isUser: false });
    }
  }, []);

  useEffect(() => {
    async function getPermissions() {
      try {
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
        // 음성 → 텍스트 변환 후 채팅 전송
        appendMessage({ text: "음성 인식 중...", isUser: false });
        const transcript = await transcribeVoice(audioUri);
        if (transcript) {
          await handleTextSubmit(transcript);
        } else {
          appendMessage({
            text: "음성에서 텍스트를 추출하지 못했어요.",
            isUser: false,
          });
        }
      }
    } else {
      await startRecording();
    }
  }

  async function handlePdfUpload() {
    try {
      // DocumentPicker의 타입 정의가 환경에 따라 달라 TS 에러가 날 수 있어 any로 처리
      // 일부 환경에서는 MIME 필터가 작동하지 않아 취소되는 경우가 있으므로 모든 타입 허용 후 확장자로 검사
      const res: any = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log("DocumentPicker result:", res);

      // 여러 환경에서 반환 형태가 다르므로 유연하게 처리
      if (!res) {
        appendMessage({
          text: "PDF 선택 결과를 받지 못했습니다.",
          isUser: false,
        });
        return;
      }

      // 사용자가 취소했을 가능성 체크 (type 또는 cancelled 플래그)
      if (
        res.type === "cancel" ||
        res.type === "dismiss" ||
        res.cancelled === true
      ) {
        appendMessage({
          text: `PDF 선택이 취소되었습니다. 결과: ${JSON.stringify(res)}`,
          isUser: false,
        });
        return;
      }

      // uri가 있으면 성공으로 간주
      // 다양한 반환 형식 지원: res.uri, res.fileUri, res.assets[0].uri 등
      let uri: string | undefined =
        res.uri || res.fileUri || res.documentUri || res.output;
      let name: string | undefined = res.name || res.fileName;
      let mime: string | undefined = res.mimeType || res.type;
      // Expo DocumentPicker (assets 배열) 형태 처리
      if (
        (!uri || !name) &&
        Array.isArray(res.assets) &&
        res.assets.length > 0
      ) {
        const asset = res.assets[0];
        uri = uri || asset.uri || asset.fileUri || asset.documentUri;
        name =
          name ||
          asset.name ||
          asset.fileName ||
          (asset.uri ? asset.uri.split("/").pop() : undefined);
        mime = mime || asset.mimeType || asset.type;
      }
      // 일부 환경은 canceled 필드 사용
      if (res.canceled === true) {
        appendMessage({
          text: `PDF 선택이 취소되었습니다. 결과: ${JSON.stringify(res)}`,
          isUser: false,
        });
        return;
      }

      if (!uri) {
        // 디버깅용으로 반환 객체를 채팅에 표시(개발 시에만 유용)
        appendMessage({
          text: `선택된 파일 정보가 없습니다. 결과: ${JSON.stringify(res)}`,
          isUser: false,
        });
        return;
      }

      // 확장자로 PDF인지 확인 (대소문자 무시)
      const isPdf =
        (name || uri).toLowerCase().endsWith(".pdf") ||
        (mime || "").toLowerCase().includes("pdf");
      if (!isPdf) {
        appendMessage({
          text: `선택된 파일은 PDF가 아닙니다. (${name ?? uri})`,
          isUser: false,
        });
        return;
      }

      // Android의 content:// 같은 경우 서버 업로드 전 앱 내부 캐시로 복사 시도
      let uploadUri = uri;
      if (uri.startsWith("content://")) {
        try {
          const dest =
            FileSystem.cacheDirectory + (name || `upload-${Date.now()}.pdf`);
          const downloaded = await FileSystem.downloadAsync(uri, dest);
          uploadUri = downloaded.uri;
          appendMessage({
            text: `content:// 파일을 앱 캐시로 복사: ${uploadUri}`,
            isUser: false,
          });
        } catch (copyErr) {
          console.warn(
            "content:// 복사 실패, 원본 URI로 업로드 시도합니다.",
            copyErr
          );
          appendMessage({
            text: `content:// 캐시 복사 실패: ${String(
              copyErr
            )}. 원본 URI로 업로드 시도합니다.`,
            isUser: false,
          });
        }
      }

      appendMessage({ text: `업로드: ${name ?? "(이름없음)"}`, isUser: true });

      const form = new FormData();
      // React Native FormData 파일 객체 형식
      form.append("pdf", {
        uri: uploadUri,
        name: name || `upload-${Date.now()}.pdf`,
        type: "application/pdf",
      } as any);

      appendMessage({ text: "업로드 중...", isUser: false });

      const uploadPath = `${baseUrl}/api/agents/upload`; // 필요시 경로 변경
      const resp = await authFetch(uploadPath, {
        method: "POST",
        body: form,
        // Content-Type 헤더는 authFetch에서 FormData인 경우 자동 처리하지 않음
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "응답이 없습니다");
        appendMessage({
          text: `업로드 실패: ${resp.status} ${resp.statusText} - ${text}`,
          isUser: false,
        });
        return;
      }

      const json = await resp.json().catch(() => null);
      if (json && json.isSuccess) {
        const msg =
          typeof json.data === "string"
            ? json.data
            : json.message ?? "PDF 업로드 성공";
        appendMessage({ text: `업로드 완료: ${msg}`, isUser: false });
      } else {
        appendMessage({
          text: `업로드 완료됐으나 서버 응답 이상: ${JSON.stringify(json)}`,
          isUser: false,
        });
      }

      // Android의 content:// URI는 서버가 직접 처리하지 못할 수 있다는 안내
      if (uri.startsWith("content://")) {
        appendMessage({
          text: "주의: Android의 content:// URI는 일부 서버에서 직접 업로드를 처리하지 못할 수 있습니다. 문제가 있으면 알려주세요.",
          isUser: false,
        });
      }
    } catch (err) {
      console.error("PDF 업로드 실패", err);
      appendMessage({ text: `PDF 업로드 오류: ${String(err)}`, isUser: false });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Header title="경청이" leftIcon={true} rightIcon={false} />
      <ScrollView
        ref={scrollRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            {message.audioUrl && (
              <View style={styles.audioWave}>
                {/* 오디오 웨이브폼 컴포넌트 */}
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                message.isUser
                  ? styles.userMessageText
                  : styles.assistantMessageText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Pressable style={styles.button} onPress={handleRecordButtonPress}>
          {recording ? <StopIcon /> : <MicWhiteIcon />}
        </Pressable>
        <Search
          placeholder="경청이와 대화하기"
          text="전송"
          value={query}
          onChangeText={setQuery}
          onSubmit={handleTextSubmit}
        />
        {/*<Pressable style={styles.pdfButton} onPress={handlePdfUpload}>
          <Text style={styles.pdfButtonText}>PDF 업로드</Text>
        </Pressable>*/}
        <Text style={styles.recordButtonText}>{recording ? "전송" : ""}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.sub2,
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 20,
    paddingBottom: 100, // 하단 여백 추가
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 15,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: lightColors.main,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: lightColors.white,
  },
  messageText: {
    fontSize: 24,
    fontFamily: FONTS.REGULAR,
  },
  userMessageText: {
    color: lightColors.white,
  },
  assistantMessageText: {
    color: lightColors.black,
  },
  audioWave: {
    height: 40,
    marginBottom: 10,
    backgroundColor: lightColors.white,
    borderRadius: 10,
  },
  bottomContainer: {
    alignItems: "flex-end",
    padding: 20,
    gap: 10,
  },
  chatButton: {
    backgroundColor: lightColors.white,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: lightColors.main,
  },
  chatButtonText: {
    color: lightColors.black,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  recordButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: lightColors.main,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    backgroundColor: lightColors.red,
  },
  recordButtonText: {
    color: lightColors.white,
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    marginTop: 5,
  },
  button: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightColors.main,
    borderRadius: "50%",
  },
  pdfButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: lightColors.white,
    borderWidth: 1,
    borderColor: lightColors.main,
    alignItems: "center",
  },
  pdfButtonText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.main,
  },
});
