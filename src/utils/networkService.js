import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userConstants } from '../constants/user';
import { handleUnauthorizedError } from './dispatchHelper';
import NetInfo from '@react-native-community/netinfo';

const defaultErrorMessage =
  "Sorry, that doesn't look right. We’re working on fixing it. Please try again in sometime.";
const defaultConnectionErrorMessage =
  "Looks like you're offline. Please reconnect and refresh to continue.";

const apiClient = axios.create({
  baseURL: 'http://13.55.207.172/api',
  timeout: 120 * 1000,
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async function (config) {
    const isInternetAvailable = await AsyncStorage.getItem(
      userConstants.isInternetAvailable,
    );
    if (isInternetAvailable === 'false') {
      return Promise.reject({
        response: {
          data: {
            message:
              'No internet connection or internet connection is unreachable. Please check your internet and try again later.',
          },
        },
      });
    }
    const token = await AsyncStorage.getItem(userConstants.tokenVariable);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
apiClient.interceptors.response.use(
  async function (response) {
    const token = response?.data?.body?.accesstoken;
    if (token) {
      await AsyncStorage.setItem(userConstants.tokenVariable, token);
    }
    return response;
  },

  async function (error) {
    if (
      error?.response?.data?.status === 401 ||
      error?.response?.data?.status === 403
    ) {
      await AsyncStorage.removeItem(userConstants.tokenVariable);
      handleUnauthorizedError();
      return Promise.reject({
        response: {
          data: {
            message:
              'Your session has expired. Please login again to continue using application.',
            status: error?.response?.data?.status,
          },
        },
      });
    } else {
      return Promise.reject(error);
    }
  },
);

const NetworkErrors = {
  NoInternet: 'NoInternet',
  RequestTimedOut: 'RequestTimedOut',
  BadGateway: 'BadGateway',
  NotFound: 'NotFound',
  Forbidden: 'Forbidden',
  InternalServerError: 'InternalServerError',
  UnknownError: 'UnknownError',
};



async function detectError(error) {
  if (error && error.data) {
    return {
      message: error.data.message || error.data.error || 'Something Went Wrong',
      code: error.status,
    };
  }
  return { message: 'Something Went Wrong', code: 0 };
}

const safeApiCall = async apiCall => {
  try {
    const response = await apiCall();
    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data.body, status: response.status };
    } else {
      const error = await detectError(response);
      return {
        success: false,
        error: error.message,
        status: response.status,
      };
    }
  } catch (error) {
    // console.log('error', error?.response);
    if (error?.response?.data?.status === 403) {
      await handleUnauthorizedError();
    }

    const detectedError = error.response
      ? await detectError(error.response)
      : { message: error.message, code: 0 };
    return {
      success: false,
      error: detectedError.message,
      status: detectedError.code,
    };
  }
};

export { safeApiCall, NetworkErrors, apiClient };
