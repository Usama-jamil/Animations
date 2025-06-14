import { Overlay } from "@rneui/base";
import { Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { colors } from "../../utils/styles";

export const CustomToast = ({ message, type, onClose }) => {
  return (
    <Overlay
      overlayStyle={{
        borderRadius: 20,
        padding: 20,
        backgroundColor: type === 'error' ? colors.whiteGray : colors.whiteGray, // Different colors for success and error
        justifyContent: 'center',
        alignItems: 'center',
      }}
      isVisible={message ? true : false}
      onBackdropPress={onClose}
    >
      <Animated.View   entering={FadeIn} exiting={FadeOut}>
        <Text style={{ color: colors.black, fontSize: 16 }}>{message}</Text>
      </Animated.View>
    </Overlay>
  );
};
