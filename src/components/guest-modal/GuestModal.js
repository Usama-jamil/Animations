import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import GeneralModal from '../modal/GeneralModal'
import { useDispatch } from 'react-redux'
import { removeLocalUser, setUser } from '../../store/slices/user'
import { useTranslation } from 'react-i18next'
import SuccessIcon from '../../../assets/icons/modal/success.svg';
import { setCompleteAddress } from '../../store/slices/location'

const GuestModal = ({showPopUp,setShowPopUp}) => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const handleBtnPress = () => {
        setShowPopUp(false);
            setTimeout(() => {
              dispatch(removeLocalUser());
              dispatch(setCompleteAddress(null));
            }, 1000);
      
    }
    
  return (
    <GeneralModal
      modalSuccess={showPopUp}
      Set_Modal_Visibilty={setShowPopUp}
      imageSource={<SuccessIcon width={60} height={60} />}
      title={t('guestSession')}
      description={t('pleaseLoginToProceed')}
      yesBtnTitle={t('loginNow')}
      noBtnTitle={t('cancel')}
      handleYesPress={handleBtnPress}
      handleNoPress={()=> setShowPopUp(false)}
    />
  )
}

export default GuestModal

const styles = StyleSheet.create({})