import React, { useState } from 'react';
import ImageView from 'react-native-image-viewing';

const ImagePreview = ({ images, isVisible, onClose,imageIndex }) => {

  return (
    <ImageView
      images={images}
      imageIndex={imageIndex || 0}
      visible={isVisible}
      onRequestClose={onClose}
    />
  );
};

export default ImagePreview;
