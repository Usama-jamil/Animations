import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import {colors, fonts, fontSizes} from '../../utils/styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfessionalList = ({data}) => {
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={{position: 'relative'}}>
        <Image source={{uri:item?.user?.image}} style={styles.image} />
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color="#FFC403" />
          <Text style={styles.ratingText}>{item?.totalReviews}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.name}>{item?.user?.name}</Text>
        <Text style={styles.role}>{item?.jobTitle}</Text>
      </View>
    </View>
  );

  return (
      <FlatList
        data={data}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{marginTop: 10, paddingBottom: 50, gap: 10}}
        columnWrapperStyle={{flex: 1, gap: 10}}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderColor,
    flex: 1,
    padding: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  ratingBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: colors.background,
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    marginLeft: 3,
  },
  cardFooter: {
    marginTop: 10,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.small,
    color: colors.black,
  },
  role: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.mSmall,
    color: colors.lightBlack,
  },
});

export default ProfessionalList;
