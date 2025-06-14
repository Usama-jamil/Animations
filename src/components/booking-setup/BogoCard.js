import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fonts} from '../../utils/styles';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {RemoveSelectedBogo, SetSelectedBogo} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import {useRoute} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

const BogoCard = ({data}) => {
  const {t} = useTranslation();
  const {selectBogo, branchid} = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const filteredBogos = selectBogo.filter(bogo => bogo.branch === branchid);
  const route = useRoute();

  const handleAddRemove = item => {
    const isAlreadySelected = checkAlreadySelected(item._id);

    if (isAlreadySelected) {
      // Remove from Redux
      dispatch(RemoveSelectedBogo(item._id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('Success'),
        text2: t('bogoRemovedSuccessfully'),
        visibilityTime: 3000,
      });
    } else {
      // Add to Redux
      dispatch(SetSelectedBogo(item));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('Success'),
        text2: t('bogoAddSuccessfully'),
        visibilityTime: 3000,
      });
    }
  };

  const checkAlreadySelected = itemId => {
    return filteredBogos.some(bogo => bogo?._id === itemId);
  };
  const renderBundleDeal = ({item}) => {
    const isSelected = checkAlreadySelected(item._id);
    return (
      <View
        style={[
          {
            backgroundColor: '#FAFAFA',
            borderRadius: 12,
            padding: 10,
            flexWrap: 'wrap',
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}>
          {/* Paid Services Section */}
          <View style={{flex: 1}}>
            {item.services?.map((service, index) => (
              <View
                key={`service-${index}`}
                style={[styles.inner_card, {marginBottom: 10}]}>
                <FastImage
                  source={{uri: service.images?.[0]}}
                  style={styles.serviceIcon}
                  resizeMode="cover"
                />
                <Text style={styles.serviceTitle}>Paid Service</Text>
                <Text style={styles.servicePrice}>
                  {service.price} {item?.currency?.code}
                </Text>
              </View>
            ))}
          </View>

          {/* Free Services Section */}
          <View style={{flex: 1}}>
            {item.freeServices?.map((freeService, index) => (
              <View
                key={`freeService-${index}`}
                style={[styles.inner_card, {marginBottom: 10}]}>
                <FastImage
                  source={{uri: freeService.images?.[0]}}
                  style={styles.serviceIcon}
                  resizeMode="cover"
                />
                <Text style={styles.serviceTitle}>Free Service</Text>
                <Text
                  style={[
                    styles.servicePrice,
                    {
                      textDecorationLine: 'line-through',
                      textDecorationColor: isSelected
                        ? colors.warning
                        : colors.primary,
                    },
                  ]}>
                  {freeService.price} {item?.currency?.code}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {route.name !== 'ReviewConfirm' && (
          <TouchableOpacity
            style={[
              commonStyles.btnContainer,
              {backgroundColor: isSelected ? colors.warning : colors.primary},
            ]}
            onPress={() => handleAddRemove(item)}>
            <Text
              allowFontScaling={false}
              style={[commonStyles.btnText, {color: colors.background}]}>
              {isSelected ? t('remove') : t('buy')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderBundleDeal}
      keyExtractor={item => item._id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default BogoCard;

const styles = StyleSheet.create({
  card: {
    padding: 8,
    marginTop: 5,
    paddingBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inner_card: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 12,
  },
  image: {
    height: 124,
    width: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
    position: 'relative',
  },

  dealTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountedPrice: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warning,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.whiteGray,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  discountText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.purple,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 16,
    height: 16,
    tintColor: colors.gray,
    marginRight: 8,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    tintColor: colors.graycolor,
    marginRight: 8,
  },
  timeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.purple,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    ...commonStyles.btnContainer,
    marginHorizontal: 20,
  },
  addButtonText: {
    ...commonStyles.btnText,
    color: colors.white,
  },
  discountHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.purple,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    width: isSmallScreen ? 14 : 16,
    height: isSmallScreen ? 14 : 16,
    resizeMode: 'contain',
  },

  serviceIcon: {
    width: '100%',
    height: 84,
    marginRight: 10,
    tintColor: colors.purple, // or whatever color you prefer
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});
