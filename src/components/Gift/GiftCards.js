import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { colors, fontSizes, fonts } from '../../utils/styles';
import Circle_check from '../../../assets/icons/circle_check_fill.svg';
import Circle_Uncheck from '../../../assets/icons/circle_check_unfill.svg';
import { commonStyles } from '../../utils/styles';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS, getRequest } from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import { ActivityIndicator } from 'react-native';
const gift_PER_PAGE = 10;

const GiftCardsComponent = ({ branchid,selectedGiftCards }) => {
  const [selectedCards, setSelectedCards] = useState(new Set());
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [giftPage, setGiftPage] = useState(1);
  const [giftTotalPages, setGiftTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  console.log('selectedGiftCards',selectedGiftCards)

  useEffect(() => {
    if (selectedGiftCards && selectedGiftCards.length > 0) {
      const preSelected = new Set(selectedGiftCards.map(card => card._id));
      setSelectedCards(preSelected);
    }
  }, [selectedGiftCards, giftCards]);
  

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);

    const result = await getRequest(
      `${API_ENDPOINTS.giftCards.getAll
      }?pageno=${1}&limit=${gift_PER_PAGE}&branch=${branchid}`,
    );
    setIsLoading(false);
    if (result.success) {
      setGiftCards(result?.data.data);
      setGiftTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreGifts = async () => {
    if (giftPage < giftTotalPages) {
      const nextPage = giftPage + 1;
      setGiftPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.giftCards.getAll}?pageno=${nextPage}&limit=${gift_PER_PAGE}`,
      );

      if (result?.success) {
        const newGifts = result?.data.data;
        setGiftCards([...giftCards, ...newGifts]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    const result = await getRequest(
      `${API_ENDPOINTS.giftCards.getAll}?pageno=${1}&limit=${gift_PER_PAGE}`,
    );

    setRefreshing(false);

    if (result.success) {
      setGiftCards(result?.data.data);
      setGiftTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handlePress = id => {
    setSelectedCards(prevState => {
      const newState = new Set(prevState);
      if (newState.has(id)) {
        newState.delete(id);
      } else {
        newState.add(id);
      }
      return newState;
    });
  };


  const getSelectedCardsArray = () => {
    return Array.from(selectedCards).map(cardId => {
      const card = giftCards.find(card => card._id === cardId);
      return {
        _id: card._id,
        code: card.code,
        amount: card.amount,
      };
    });
  };


  const formatPrice = (price) => {
    if (price > Number.MAX_SAFE_INTEGER) {
      // For extremely large numbers, format using exponential notation
      return price.toExponential(2);
    } else {
      // Use toFixed for numbers within a safe range
      return price.toFixed(2);
    }
  };
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.whiteGray },
      ]}
      onPress={() => handlePress(item._id)}>
      <Text allowFontScaling={false} style={styles.title}>
        {item?.type}
      </Text>

      <View style={{ alignSelf: 'flex-end' }}>
        {selectedCards.has(item._id) ? (
          <Circle_check width={24} height={24} />
        ) : (
          <Circle_Uncheck width={24} height={24} />
        )}
      </View>

      <Text allowFontScaling={false} style={styles.price}>
        {formatPrice(item?.amount)}
        <Text allowFontScaling={false} style={styles.currency}>
          {' '} {item?.currency?.code}
        </Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      {isLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {giftCards.length > 0 ? (
              <FlatList
                data={giftCards}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                onEndReached={handleLoadMoreGifts}
                onEndReachedThreshold={0.6}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{ marginBottom: 80 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text allowFontScaling={false} style={styles.noDataText}>
                {t('noDataFound')}
              </Text>
            )}
          </ScrollView>


          {selectedCards.size > 0 && (

            <TouchableOpacity
              style={[styles.continueButton, commonStyles.btnContainer]}
              onPress={() =>
                navigation.navigate('ReviewConfirm', {
                  data: getSelectedCardsArray(),
                  
                })
              }>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('add')}
              </Text>
            </TouchableOpacity>

          )}
        </>
      )}
    </>
  );
};

export default GiftCardsComponent;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 18,
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  title: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  price: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: -10,
  },
  currency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
