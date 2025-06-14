import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, fonts, fontSizes} from '../../utils/styles';

import NextIcon from '../../../assets/icons/arrow-right.svg';
import UserIcon from '../../../assets/icons/auth/user.svg';

import UsersIcon from '../../../assets/icons/header/users.svg';

import {commonStyles} from '../../utils/styles';
import Images from '../../components/card-images/Images';
import {API_ENDPOINTS} from '../../utils/apiService';
import {getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {SetServiceBasedMembers, SetTeamMembers} from '../../store/slices/cart';

import Toast from 'react-native-toast-message';
import GeneralModal from '../../components/modal/GeneralModal';

const Profession = ({navigation}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [Members, setMembers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const {branchid, activeRadio, selectBundles, selectBogo,selectServies} = useSelector(
    state => state.cart,
  );

  console.log('activeRadio', activeRadio);

  const dispatch = useDispatch();

  const bookingFor = activeRadio === 'HomeService' ? 'homeservice' : 'inplace';

  // const filteredBundles = selectBundles.filter(
  //   bundle => bundle.branch === branchid,
  // );

  //  const filteredServices = useMemo(() => {
  //     return selectServies.filter(
  //       service =>
  //         service.branch === branchid &&
  //         (!service.type || service.type === '' || service.type === null),
  //     );
  //   }, [selectServies, branchid]);
  

  // const filteredBogo = selectBogo.filter(bogo => bogo.branch === branchid);
  // const bogoServiceIds = filteredBogo.flatMap(bogo => [
  //   ...bogo.services.map(service => service._id),
  //   ...bogo.freeServices.map(service => service._id),
  // ]);

  // // Extract service and inventory IDs from Bundles
  // const bundleServiceIds = filteredBundles.flatMap(bundle =>
  //   bundle.services.map(service => service._id),
  // );

  // const allServiceIds = [
  //   ...filteredServices.map(service => service._id),
  //   ...bogoServiceIds,
  //   ...bundleServiceIds,
  // ];

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setSelectedItems([]);
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.teamMembers.getAll}?branch=${branchid}&serviceType=${bookingFor}`,
    );
    setIsLoading(false);
    if (result.success) {
      setMembers(result?.data.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const selectRandomMember = () => {
    if (Members.length > 0) {
      const randomIndex = Math.floor(Math.random() * Members.length);
      const selectedMember = Members[randomIndex];

      console.log('selected member:', selectedMember);

      const selectedMemberArray = [selectedMember]; // Wrap the selected member in an array

      dispatch(SetTeamMembers(selectedMemberArray)); // Dispatch the array

      navigation.navigate('SelectTime', {
        selectedItems: selectedMemberArray,
        single: true,
      });
    }
  };

  const NextStep = () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('selectionRequired'),
        text2: t('pleaseSelectMember'),
      });
      return;
    }
    dispatch(SetTeamMembers(selectedItems));

    navigation.navigate('SelectTime', {selectedItems, single: true});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('selectProfessionals')} />

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
      ) : Members?.length > 0 ? (
        <>
          <ScrollView
            style={{marginHorizontal: 10}}
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.banner}
              onPress={selectRandomMember}>
              <View style={styles.bannerleft}>
                <UserIcon width={16} height={16} />
                <Text allowFontScaling={false} style={styles.title}>
                  {t('anyProfessional')}
                </Text>
              </View>
              <NextIcon width={24} height={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.banner}
              onPress={() => navigation.navigate('SelectProfessionals')}>
              <View style={styles.bannerleft}>
                <UsersIcon width={20} height={20} />
                <Text allowFontScaling={false} style={styles.title}>
                  {t('selectProfessionalPerService')}
                </Text>
              </View>

              <NextIcon width={24} height={24} />
            </TouchableOpacity>

            <Images
              data={Members}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          </ScrollView>
          {selectedItems.length > 0 && (
            <TouchableOpacity
              style={[styles.continueButton, commonStyles.btnContainer]}
              onPress={NextStep}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('continue')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
    </SafeAreaView>
  );
};

export default Profession;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    paddingHorizontal: 9,
    paddingVertical: 13,
    backgroundColor: colors.lightGrey,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerleft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  continueButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
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
