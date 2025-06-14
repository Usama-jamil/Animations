import { useState } from 'react';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { postRequest, getRequest, API_ENDPOINTS } from '../../utils/apiService';
import { useSelector } from 'react-redux';

const usePaymentSheet = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isPaymentSheetInitialized, setIsPaymentSheetInitialized] = useState(false);
  const [intentId, setIntentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {businessName} = useSelector(state => state.cart);

  const fetchSetupIntentParams = async () => {
    try {
      const response = await getRequest(API_ENDPOINTS.createSetupIntent.get);

      const { customer, intent, ephemeralKey, intentId } = response?.data;

      if (!customer || !intent || !ephemeralKey) {
        throw new Error('Missing required setup intent data.');
      }

      setIntentId(intentId);
      return { customer, intent, ephemeralKey };
    } catch (error) {
      console.error('Setup Intent Error:', error);
      Alert.alert('Error', 'Failed to retrieve setup intent.');
      return null;
    }
  };

  const initializePaymentSheet = async () => {
    setIsLoading(true);
    try {
      const setupData = await fetchSetupIntentParams();
      if (!setupData) {
        throw new Error('Setup Intent Data is null');
      }

      const paymentConfig = {
        customerId: setupData.customer,
        customerEphemeralKeySecret: setupData.ephemeralKey,
        setupIntentClientSecret: setupData.intent,
        allowsDelayedPaymentMethods: true,
        merchantDisplayName: `PAY ${businessName} (VIA Timezzi)`,
        applePay: { merchantCountryCode: 'US', currencyCode: 'usd' },
        googlePay: {
          merchantCountryCode: 'US',
          currencyCode: 'usd',
        },
      };

      console.log('Initializing Payment Sheet...');
      const { error } = await initPaymentSheet(paymentConfig);
      if (error) {
        throw new Error(error.message);
      }

      console.log('Payment Sheet Initialized Successfully');
      setIsPaymentSheetInitialized(true);
    } catch (error) {
      console.error('Initialization Error:', error);
      Alert.alert('Initialization Failed', error.message || 'Failed to initialize payment sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (!isPaymentSheetInitialized) {
      Alert.alert('Error', 'Payment sheet is not initialized. Please wait and try again.');
      console.error('Error: Payment sheet is not initialized');
      return null;
    }
  
  
    const { error } = await presentPaymentSheet();
    if (error) {
    console.log('Payment Failed', error.message);
      return null;
    } else {
      try {
        console.log('Fetching Payment Method ID...');
        
        const response = await getRequest(`${API_ENDPOINTS.createSetupIntent.getPaymentId}/${intentId}`);
        console.log('Payment Method Response:', response);
  
        const paymentMethodId = response?.data?.payment_method;
        if (!paymentMethodId) {
          throw new Error('Payment method ID not found in response.');
        }
  
        console.log('Payment Method ID:', paymentMethodId);
  
        // ✅ Check if the payment method already exists
        const existingCardsResponse = await getRequest(API_ENDPOINTS.cardManagement.payment);
        console.log('Existing Cards:', existingCardsResponse);
  
        const existingCards = existingCardsResponse?.data || [];
  
        const cardAlreadyExists = existingCards.some(card => card.id === paymentMethodId);
  
        if (cardAlreadyExists) {
          console.log('Card already exists, not creating a new one.');
          return paymentMethodId; // ✅ Return the existing card
        }
  
        // ✅ If card does not exist, link it
        await postRequest(`${API_ENDPOINTS.createSetupIntent.linkCard}`, { paymentMethodId });
  
        console.log('Card linked successfully');
        return paymentMethodId;
      } catch (error) {
        console.error('Error linking card:', error);
        Alert.alert('Error', 'Failed to link card.');
        return null;
      }
    }
  };
  

  return {
    initializePaymentSheet,
    openPaymentSheet,
    isLoading,
  };
};

export default usePaymentSheet;
