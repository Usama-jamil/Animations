import {useCallback, useMemo} from 'react';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';

export const useBookingOverViewCalculation = ({
  selectServies,
  SelectedProducts,
  branchid,
  activeRadio,
  fare,
  selectBundles,
  selectBogo,
  firstcomapignid,
}) => {
  // Filtering logic
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

  console.log('filteredProductsForCompaign', filteredProductsForCompaign);

  const campaignIds = useMemo(() => {
    return [
      ...filteredBogo.map(bogo => bogo._id),
      ...filteredBundles.map(bundle => bundle._id),
    ];
  }, [filteredBogo, filteredBundles]);

  // Calculation function

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

    // Determine if we should include the firstcomapignid
    const hasOtherCampaigns =
      filteredProductsForCompaign?.length > 0 ||
      filteredServicesForCompaign?.length > 0 ||
      campaignIds.length > 0;

    const shouldIncludeFirstCampaign = firstcomapignid && !hasOtherCampaigns;

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
        compaigns: [firstcomapignid],
      }),

      ...(hasOtherCampaigns && {
        compaigns: [
          ...filteredServicesForCompaign?.map(product => product.compaignId),
          ...(filteredProductsForCompaign?.[0]?.compaignId
            ? [filteredProductsForCompaign[0].compaignId]
            : []),

          ...campaignIds,
        ],
      }),

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
    firstcomapignid,
    filteredProductsForCompaign,
    filteredServicesForCompaign,
    bogoServiceIds,
    bundleServiceIds,
    bundleInventoryIds,
    campaignIds,
  ]);

  return {
    fetchCalculation,
    filteredProducts,
    filteredServices,
    filteredBundles,
    filteredBogo,
    filteredServicesForCompaign,
  };
};
