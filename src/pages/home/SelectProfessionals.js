import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {colors, fontSizes, fonts, commonStyles} from '../../utils/styles';
import ChevronIcon from '../../../assets/icons/auth/chevron.svg';
import UserIcon from '../../../assets/icons/auth/user.svg';
import {Dropdown} from 'react-native-element-dropdown';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS} from '../../utils/apiService';
import {getRequest} from '../../utils/apiService';
import {useDispatch, useSelector} from 'react-redux';
import {
  SetSelectedServiceEmpty,
  SetServiceBasedMembers,
  SetTeamMembers,
} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import GeneralModal from '../../components/modal/GeneralModal';
const SelectProfessionals = ({navigation}) => {
  const {t} = useTranslation();

  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [Members, setMembers] = useState([]);
  const dispatch = useDispatch();
  const {selectServies, branchid} = useSelector(state => state.cart);

  const filteredServices = selectServies.filter(
    service => service.branch === branchid,
  );

  console.log('members', Members?.length);
  console.log('filterservices', filteredServices?.length);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.teamMembers.getAll}?branch=${branchid}`,
    );
    setIsLoading(false);
    if (result.success) {
      setMembers(result?.data.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleSelection = (service, item) => {
    if (item.value === 'any') {
      const randomMember = Members[Math.floor(Math.random() * Members.length)];
      setSelectedProfessionals(prevState => ({
        ...prevState,
        [service._id]: {
          member: randomMember,
          service: service,
        },
      }));
    } else {
      const selectedMember = Members.find(
        member => member.user._id === item.value,
      );
      setSelectedProfessionals(prevState => ({
        ...prevState,
        [service._id]: {
          member: selectedMember,
          service: service,
        },
      }));
    }
  };

  const renderItem = () => <ChevronIcon width={24} height={24} />;

const Userdata = [
  { label: t('anyProfessional'), value: 'any' },
  ...Members.map(member => ({
    label: member.jobTitle ? `${member.user.name} - (${member.jobTitle})` : member.user.name, // Concatenate name and job title
    value: member.user._id,
  })),
];



  const NextStep = () => {
    if (Object.keys(selectedProfessionals).length === 0) {
      Toast.show({
        type: 'error',
        text1: t('selectionRequired'),
        text2: t('pleaseSelectMember'),
      });
      return;
    }

    dispatch(SetServiceBasedMembers(selectedProfessionals));
    dispatch(SetTeamMembers([]));

    const selectedItems = Object.keys(selectedProfessionals).map(serviceId => ({
      ...selectedProfessionals[serviceId].member,
    }));

    navigation.navigate('SelectTime', {selectedItems, single: false});
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}>
            {filteredServices.length === 0 ? (
              <Text allowFontScaling={false} style={styles.noServiceText}>
                {t('noServiceSelected')}
              </Text>
            ) : (
              filteredServices.map((data, index) => (
                <View
                  key={index}
                  style={[styles.banner, {backgroundColor: colors.whiteGray}]}>
                  <Text allowFontScaling={false} style={styles.title}>
                    {data?.title}
                  </Text>
                  <View style={styles.textInputContainer}>
                    <View style={styles.bannerLeft}>
                      <UserIcon width={16} height={16} />
                      <Dropdown
                        style={[styles.dropdown]}
                        placeholderStyle={styles.placeholderStyle}
                        placeholder={t('anyProfessional')}
                        selectedTextStyle={styles.dropDownInput}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        renderRightIcon={renderItem}
                        data={Userdata}
                        search
                        searchPlaceholder={t('search')}
                        fontFamily={fonts.regular}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        value={
                          selectedProfessionals[data._id]?.member?.user?._id ||
                          null
                        }
                        onChange={item => handleSelection(data, item)}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.continueButton, commonStyles.btnContainer]}
            onPress={NextStep}>
            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('continue')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default SelectProfessionals;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noServiceText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  banner: {
    paddingHorizontal: 9,
    paddingVertical: 13,
    borderRadius: 18,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
    marginTop: 10,
  },
  dropdown: {
    flex: 1,
    height: 50,
    fontFamily: fonts.regular,
  },
  placeholderStyle: {
    fontSize: fontSizes.xSmall,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    color: colors.placeholderGrey,
  },
  dropDownInput: {
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  inputSearchStyle: {
    height: 50,
    fontSize: 16,
    fontFamily: fonts.regular,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  continueButton: {
    position: 'absolute',
    bottom: Platform.OS ==='ios' ? 40:20 ,
    left: 20,
    right: 20,
  },
});
