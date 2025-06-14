import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Share,
} from 'react-native';
import React, {useState} from 'react';
import Info from '../../../assets/icons/circle-information.svg';
import Shares from '../../../assets/icons/Share.svg';
import BackIon from '../../../assets/icons/arrow_left.svg';
import HeartIon from '../../../assets/icons/heart_Black.svg';
import HeartIonFill from '../../../assets/icons/heart_fill.svg';

import {colors, fonts} from '../../utils/styles';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';
import Popover from 'react-native-popover-view';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import ImagePreview from '../imagePreview/ImagePreview';

const HomeDetailCover = ({
  image,
  id,
  setloading,
  activeButton,
  likes,
  fetchData,
  onBackPress,
}) => {
  const {t} = useTranslation();
  const {user} = useSelector(state => state.auth);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const isLike = likes?.includes(user?._id) || false;

  const Like = async () => {
    setloading(true);
    const result = await putRequest(
      `${API_ENDPOINTS.business.like}${id}/likes`,
    );
    setloading(false);
    if (result.success) {
      fetchData();
    } else {
      // setErr(true);
      // setErrMsg(result.error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        setImages([{uri: image}]);
        setIsPreviewVisible(true);
      }}>
      <ImageBackground
        source={{uri: image}}
        style={styles.Service_image}
        resizeMode="cover">
        <View style={styles.row}>
          <TouchableOpacity style={styles.circle} onPress={onBackPress}>
            <BackIon width={24} height={24} style={styles.circle_icon} />
          </TouchableOpacity>
          {!user?.isGuest && (
            <View style={styles.row_right_inner}>
              {/* {activeButton === 'Services' && ( */}
              <Popover
                popoverStyle={{
                  backgroundColor: colors.popBg,
                  padding: 12,
                  borderRadius: 20,
                  alignItems: 'center',
                }}
                from={
                  <TouchableOpacity style={styles.circle}>
                    <Info width={24} height={24} style={styles.circle_icon} />
                  </TouchableOpacity>
                }>
                <Text allowFontScaling={false} style={styles.pop_text}>
                  {t('onSiteOrHomeServicePopover')}
                </Text>

                <Text allowFontScaling={false} style={styles.pop_text}>
                  {t('onSiteOrHomeServicePopover2')}
                </Text>
              </Popover>
              {/* )} */}
              <TouchableOpacity style={styles.circle} onPress={Like}>
                {isLike ? (
                  <HeartIonFill
                    width={24}
                    height={24}
                    style={styles.circle_icon}
                  />
                ) : (
                  <HeartIon width={24} height={24} style={styles.circle_icon} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>

      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </TouchableOpacity>
  );
};

export default HomeDetailCover;

const styles = StyleSheet.create({
  Service_image: {
    height: 230,
    width: '100%',
    backgroundColor: colors.grey,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle_icon: {
    resizeMode: 'contain',
    tintColor: colors.black,
  },
  row_right_inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pop_text: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 20,
    backgroundColor: colors.popBg,
    color: colors.black,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
