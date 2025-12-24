declare module "react-native-waveform" {
  import { ViewProps } from "react-native";

  interface WaveformProps extends ViewProps {
    waveColor?: string;
    active?: boolean;
    duration?: number;
  }

  export const Waveform: React.FC<WaveformProps>;
}
