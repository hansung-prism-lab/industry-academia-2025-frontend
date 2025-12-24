declare module "react-native-global-props" {
  import { TextStyle, ViewStyle, ImageStyle } from "react-native";

  interface CustomTextProps {
    style?: TextStyle;
  }

  interface CustomViewProps {
    style?: ViewStyle;
  }

  interface CustomImageProps {
    style?: ImageStyle;
  }

  export function setCustomText(props: CustomTextProps): void;
  export function setCustomView(props: CustomViewProps): void;
  export function setCustomImage(props: CustomImageProps): void;
}
