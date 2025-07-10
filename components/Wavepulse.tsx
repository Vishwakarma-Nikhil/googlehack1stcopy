import React from "react";
import { View, StyleSheet } from "react-native";
import WaveRing from "./WaveRing";

const WavePulse = () => {
  return (
    <View style={styles.container}>
      <WaveRing delay={0} />
      <WaveRing delay={500} />
      <WaveRing delay={1000} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
});

export default WavePulse;
