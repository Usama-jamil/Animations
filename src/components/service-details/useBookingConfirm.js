import {useCallback, useMemo} from 'react';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';

export const useBookingConfirmCalculation = ({
  selectServies,
  SelectedProducts,
  branchid,
  activeRadio,
  fare,
  selectBundles,
  selectBogo,
  firstCompaignId,
  discountId,
  giftCardId,
  selectedGiftCards,
}) => {
  // Filtering logic remains the same
  const filteredProducts = useMemo(() => {
    return SelectedProducts.filter(product => product.branch === branchid);
  }, [SelectedProducts, branchid]);

  const filteredServices = useMemo(() => {
    return selectServies.filter(
      service =>
        service.branch === branchid &&
        (!service.compaigntype ||
          service.compaigntype === '' ||
          service.compaigntype === null),
    );
  }, [selectServies, branchid]);

  const filteredBundles = useMemo(() => {
    return selectBundles.filter(bundle => bundle.branch === branchid);
  }, [selectBundles, branchid]);

  const filteredBogo = useMemo(() => {
    return selectBogo.filter(bogo => bogo.branch === branchid);
  }, [selectBogo, branchid]);

  const filteredProductsForCompaign = useMemo(() => {
    return filteredProducts.filter(
      product => product.branch === branchid && product.compaigntype,
    );
  }, [filteredProducts, branchid]);

  const filteredServicesForCompaign = useMemo(() => {
    return selectServies.filter(
      service => service.branch === branchid && service.compaigntype,
    );
  }, [selectServies, branchid]);

  const bogoServiceIds = useMemo(() => {
    return filteredBogo.flatMap(bogo => [
      ...bogo.services.map(service => service._id),
      ...bogo.freeServices.map(service => service._id),
    ]);
  }, [filteredBogo]);

  const bundleServiceIds = useMemo(() => {
    return filteredBundles.flatMap(bundle =>
      bundle.services.map(service => service._id),
    );
  }, [filteredBundles]);

  const bundleInventoryIds = useMemo(() => {
    return filteredBundles.flatMap(bundle =>
      bundle.inventories.map(inventory => inventory._id),
    );
  }, [filteredBundles]);

  const campaignIds = useMemo(() => {
    return [
      ...filteredBogo.map(bogo => bogo._id),
      ...filteredBundles.map(bundle => bundle._id),
    ];
  }, [filteredBogo, filteredBundles]);

  // Updated calculation function to include gift cards and discounts
  const fetchCalculation = useCallback(async () => {
    const bookingFor =
      activeRadio === 'HomeService' ? 'homeservice' : 'inplace';

    const allServiceIds = [
      ...filteredServices.map(service => service._id),
      ...bogoServiceIds,
      ...bundleServiceIds,
      ...(filteredServicesForCompaign?.flatMap(campaign =>
        campaign.services.map(service => service._id),
      ) || []),
    ];

    const allInventoryIds = [
      ...filteredProducts.map(product => product.inventory),
      ...bundleInventoryIds,
    ];

    const hasOtherCampaigns =
      filteredProductsForCompaign?.length > 0 ||
      filteredServicesForCompaign?.length > 0 ||
      campaignIds.length > 0;

    const shouldIncludeFirstCampaign = firstCompaignId && !hasOtherCampaigns;

    const payload = {
      services: allServiceIds?.map(serviceId => ({
        service: serviceId,
      })),

      ...(allInventoryIds?.length > 0 && {
        inventories: [
          ...filteredProducts?.map(data => ({
            inventory: data?.inventory,
            ...(data?.varinat && {variant: data?.varinat}),
            quantity: data?.quantity,
          })),
          ...bundleInventoryIds.map(inventoryId => ({
            inventory: inventoryId,
          })),
        ],
      }),
      bookingFor,

      ...(bookingFor === 'homeservice' && {fare}),

      ...(shouldIncludeFirstCampaign && {
        compaigns: [firstCompaignId],
      }),

      ...(hasOtherCampaigns && {
        compaigns: [
          ...filteredServicesForCompaign.map(product => product.compaignId),
  ...(filteredProductsForCompaign?.[0]?.compaignId
            ? [filteredProductsForCompaign[0].compaignId]
            : []),
          ...campaignIds,
        ],
      }),

      // Add gift cards and discounts
      ...(selectedGiftCards?.length > 0 && {
        giftCards: selectedGiftCards.map(card => card._id),
      }),
      ...(discountId && {discount: discountId}),
      ...(giftCardId && {giftCard: giftCardId}),

      branch: branchid,
    };

    const result = await postRequest(API_ENDPOINTS.booking.validate, payload);
    return result;
  }, [
    branchid,
    activeRadio,
    fare,
    filteredServices,
    filteredProducts,
    filteredBogo,
    filteredBundles,
    firstCompaignId,
    filteredServicesForCompaign,
    filteredProductsForCompaign,
    bogoServiceIds,
    bundleServiceIds,
    bundleInventoryIds,
    campaignIds,
    discountId,
    giftCardId,
    selectedGiftCards,
  ]);

  return {
    fetchCalculation,
    filteredProducts,
    filteredServices,
    filteredBundles,
    filteredBogo,
  };
};
