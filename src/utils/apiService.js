import {safeApiCall, apiClient} from './networkService';

const getRequest = async endpoint => {
  console.log('endpoint', endpoint);
  return await safeApiCall(() => apiClient.get(endpoint));
};

const postRequest = async (endpoint, payload) => {
  console.log('endpoint and payload data', endpoint, payload);
  return await safeApiCall(() => apiClient.post(endpoint, payload));
};

const deleteRequest = async (endpoint, payload) => {
  // console.log('endpoint and payload data', endpoint, payload);
  return await safeApiCall(() =>
    apiClient.delete(endpoint, {
      data: payload,
    }),
  );
};

const putRequest = async (endpoint, payload) => {
  console.log('payload data', endpoint, payload);

  return await safeApiCall(() => apiClient.put(endpoint, payload));
};

const postFormRequest = async (endpoint, formData) => {
  return await safeApiCall(() =>
    apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );
};

const putFormRequest = async (endpoint, formData) => {
  return await safeApiCall(() =>
    apiClient.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );
};

const imageUploadRequest = async (endpoint, formData) => {
  return await safeApiCall(() =>
    apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'secret-key':
          '4736fc95708dfe4ec48f407fdd58829433d16c05d7609ebbe968435edafa2373da15f205f581cf606a506c4f47b6e25ec82035a5656ac61f8fab27817d195049',
      },
    }),
  );
};

export {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
  postFormRequest,
  putFormRequest,
  imageUploadRequest,
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    socialLogin: '/auth/social_login',
    logout: '/auth/logout',
    delete: '/auth/deleteUser/',
    otpVerify: '/auth/validatepin',
    otpReSend: '/auth/forgotpassword',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgotpassword',
    activateAccount: '/auth/validatepin',
    resetPassword: '/auth/resetpassword',
    about: '/admin/about',
    privacy: '/admin/privacy',
    contact: '/auth/contact',
    faq: '/admin/faq',
    profile: '/auth/me',
    profileUpdate: '/auth/profileUpdate',
    terms: 'admin/tac?type=1',
    guest: '/auth/guest',
  },

  file: {
    fileUpload: '/file/upload',
  },

  service: {
    getAll: '/services',
    getSingle: '/services',
    getByCategory: '/services/categories',
  },

  product: {
    getAll: '/inventories',
    getSingle: '/inventories',
    suggested: '/inventories/suggested',
  },
  rental: {
    getAll: '/listings',
    getSingle: '/listings',
    getAvailibility: '/listing-bookings/availbilties',
    add: '/listing-bookings',
  },
  
  rentalBooking: {
    getAll: '/listing-bookings',
  },
  listingBookings: {
    getSingle: '/listing-bookings/',
    pickup: '/listing-bookings/pickup/',
    return: '/listing-bookings/dropoff/',
    cancel:"/listing-bookings/status/"
  },
  subscription: {
    getAll: '/memberships',
    getSingle: '/memberships',
    getUserSubscription: '/memberships/user',
    cancel: '/memberships/user',
  },
  business: {
    getAll: '/business',
    getSingle: '/business',
    like: '/business/',
  },
  home: {
    getAll: '/home',
  },
  teamMembers: {
    getAll: '/team-members',
    teamAvaliability: '/team-members/availbilties',
  },
  discount: {
    applyCode: '/discounts/single',
  },
  giftCards: {
    applyCode: '/gift-cards/user/single',
    getAll: '/gift-cards',
    giftWithStatus: '/gift-cards/user',
  },

  categorey: {
    getAll: '/categories',
  },
  booking: {
    createBooking: '/bookings',
    getWithStatus: '/bookings/',
    single: '/bookings/',
    cancel: '/bookings/cancel/',
    confirmArrival: '/bookings/',
    validate:"/bookings/validate"
  },
  conversation: {
    getAll: '/conversation/list',
    getSingle: '/conversation',
    unRead: '/conversation/unread',
  },
  wallet: {
    getAll: '/wallet',
  },
  cardManagement: {
    payment: '/payments/methods',
  },
  createSetupIntent: {
    get: '/payments/setup',
    linkCard: '/payments/methods',
    getPaymentId: '/payments/intent',
  },
  visitor: {
    visit: '/vistors/app',
  },
  compaigns: {
    getAll: '/compaigns',
    getCampaignById: '/compaigns/',
  },
  notification: {
    getAll: '/notifications',
    getUnReadCount: '/notifications/unread',
    setRead: '/notifications/read',
  },
  review: {
    add: '/reviews',
  },
  subscriptionBusiness: {
    getAll: '/subscription',
  },
  tip: {
    addTip: '/bookings/tip',
  },
  language: {
    get: '/locales/languages',
  },
};
