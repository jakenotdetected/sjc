import React, { useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://garage.jakenetwork.xyz';

export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Android back button navigates inside the WebView
  React.useEffect(() => {
    const onBack = () => {
      if (webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#0E1B2B" barStyle="light-content" />
      <WebView
        ref={webRef}
        source={{ uri: APP_URL }}
        style={styles.web}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={false}
        setSupportMultipleWindows={false}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2C6B56" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E1B2B' },
  web: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0E1B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
