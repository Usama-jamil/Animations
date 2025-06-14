import {StyleSheet, View, Text} from 'react-native';
import React, {useEffect, useRef, useState, useTransition} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {connectSocket, disconnectSocket} from '../../utils/socket';
import {useSelector} from 'react-redux';
import CustumIcon from '../../../assets/icons/marker.svg';
import Rider from '../../../assets/icons/rider.svg';
import MapViewDirections from 'react-native-maps-directions';
import {colors, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';

const ProfessionalLocation = ({id, initallocation, userlocation}) => {
  const {t} = useTranslation();
  const mapRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [origin, setorigin] = useState({
    latitude: initallocation?.coordinates?.[1] || 37.78825,
    longitude: initallocation?.coordinates?.[0] || -122.4324,
  });
  const [destination, setdestination] = useState({
    latitude: userlocation?.coordinates?.[1],
    longitude: userlocation?.coordinates?.[0],
  });
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const {user} = useSelector(state => state.auth);



  useEffect(() => {
    // Initialize the socket connection
    const initializeSocket = async () => {
      const socketInstance = await connectSocket(user, setSocket);
      setSocket(socketInstance);
    };

    initializeSocket();

    return () => {
      disconnectSocket();
    };
  }, [user]);

  useEffect(() => {
    // Update current location and animate the map when initallocation changes
    if (initallocation?.coordinates && userlocation?.coordinates) {
      const origin = {
        latitude: initallocation.coordinates[1],
        longitude: initallocation.coordinates[0],
      };
      const destination = {
        latitude: userlocation?.coordinates[1],
        longitude: userlocation?.coordinates[0],
      };

      setdestination(destination);
      setorigin(origin);

      // Animate map to the new location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...origin,
            latitudeDelta: 0.5, // Increased from 0.0922 (Zoomed Out)
            longitudeDelta: 0.25,
          },
          1000, // Animation duration in ms
        );
      }
    }
  }, [initallocation]);

  useEffect(() => {
    if (socket && socket.connected) {
      console.log('Socket connected:', socket.connected);

      // Listen for location updates
      socket.on('location_update', payload => {
        if (payload.bookingId === id) {
          console.log('Location Update Received:', payload);

          const updatedLocation = {
            latitude: payload.latitude,
            longitude: payload.longitude,
          };

          setorigin(updatedLocation);

          // Extract distance and duration from the payload
          if (payload.distance) {
            setDistance(payload.distance); // Assuming distance is in the payload
          }

          if (payload.duration) {
            setDuration(payload.duration); // Assuming duration is in the payload
          }

          // Animate the map to the updated location
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                ...updatedLocation,
                latitudeDelta: 0.5, // Increased from 0.0922 (Zoomed Out)
                longitudeDelta: 0.25,
              },
              1000,
            );
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('location_update');
      }
    };
  }, [socket, id]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        zoomEnabled={true}
        initialRegion={{
          latitude: origin?.latitude,
          longitude: origin?.longitude,
          latitudeDelta: 0.5, // Increased from 0.0922 (Zoomed Out)
          longitudeDelta: 0.25,
        }}>
        {origin && (
          <Marker
            draggable
            coordinate={origin}
            onDragStart={e => setCoord(e.nativeEvent.coordinate)}
            onDrag={e => setCoord(e.nativeEvent.coordinate)}
            onDragEnd={e => setCoord(e.nativeEvent.coordinate)}>
            <Rider width={45} height={45} stroke="purple" strokeWidth={2} />
          </Marker>
        )}

        {/* Marker for Destination */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination?.latitude,
              longitude: destination?.longitude,
            }}>
            <CustumIcon width={45} height={45} />
          </Marker>
        )}

        {origin && destination && (
          <MapViewDirections
          origin={origin}
            destination={destination}
            apikey={'AIzaSyCCwS2Ek90yyf7v704_3HQcOjk_x76rgM0'}
            strokeColor={colors.primary}
            strokeWidth={3}
            optimizeWaypoints={true}
            onStart={params => {
              console.log(
                `Started routing between "${params.origin}" and "${params.destination}"`,
              );
            }}
            mode="DRIVING"
            onError={errorMessage => {
              console.log('Error fetching directions:', errorMessage);
              if (
                errorMessage === 'Error on GMAPS route request: ZERO_RESULTS'
              ) {
                setDirectionError(t('NoRouteFound')); // Set the localized error message
              } else {
                setDirectionError(t('ErrorFetchingDirections')); // Fallback error message
              }
            }}
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        {distance && (
          <Text style={styles.infoText}>
            {t('Distance')}: {distance}
          </Text>
        )}
        {duration && (
          <Text style={styles.infoText}>
            {t('Duration')}: {duration}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    color: colors.background,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});

export default ProfessionalLocation;
