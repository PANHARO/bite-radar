import { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";
import { DemoMap, MapProps } from "./demo-map";
import { Asset } from "./ui";
import { designAssets as a } from "@/constants/design-assets";
import { useReducedMotion } from "react-native-reanimated";
export const liveMapAvailable =
  Platform.OS === "ios" || Constants.executionEnvironment === "storeClient";
export default function LiveMap(props: MapProps) {
  const reduce = useReducedMotion();
  const map = useRef<MapView>(null);
  const selected = props.spots.find((s) => s.id === props.selectedId);
  useEffect(() => {
    if (selected)
      map.current?.animateToRegion(
        {
          latitude: selected.latitude,
          longitude: selected.longitude,
          latitudeDelta: 0.023,
          longitudeDelta: 0.018,
        },
        reduce ? 0 : 300,
      );
  }, [selected, reduce]);
  if (!liveMapAvailable) return <DemoMap {...props} />;
  return (
    <MapView
      ref={map}
      style={{ width: "100%", height: props.height || 540 }}
      initialRegion={{
        latitude: 11.557,
        longitude: 104.928,
        latitudeDelta: 0.027,
        longitudeDelta: 0.022,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      customMapStyle={[
        { elementType: "geometry", stylers: [{ color: "#F4F0E7" }] },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#CCE4E7" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#DCE7D5" }],
        },
      ]}
    >
      {props.spots.map((s) => (
        <Marker
          key={s.id}
          identifier={s.id}
          coordinate={{ latitude: s.latitude, longitude: s.longitude }}
          title={s.name}
          description="Saved food spot · demo coordinates"
          onPress={() => props.onSelect(s)}
        >
          <View
            style={{
              padding: 10,
              backgroundColor:
                s.id === props.selectedId ? "#E6B800" : "#FFFFFF",
              borderWidth: 2,
              borderColor: "#E6B800",
              borderRadius: 24,
              borderBottomRightRadius: 5,
            }}
          >
            <Asset source={a["15:308"].imgUtensils} width={20} height={20} />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}
