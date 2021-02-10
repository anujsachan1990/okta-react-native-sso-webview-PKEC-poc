import React, {createRef} from 'react';
import {Button, StyleSheet, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import {WebView} from 'react-native-webview';

let webViewRef = createRef();

const INJECTED_SCRIPT = `
window.ReactNativeWebView.postMessage(document.cookie);
const tokenLocalStorage = window.localStorage.getItem('okta-token-storage');
window.ReactNativeWebView.postMessage(tokenLocalStorage);`;

export default function ModalBrowser({
  uri,
  content,
  onMessage,
  onNavigationStateChange,
  toggleModal,
  isModalVisible,
}) {
  return (
    <SafeAreaView>
      <Modal isVisible={isModalVisible} style={styles.modalContainer}>
        <WebView
          ref={webViewRef}
          source={{
            uri,
          }}
          onMessage={onMessage}
          startInLoadingState={true}
          javaScriptEnabled={true}
          sharedCookiesEnabled={true}
          injectedJavaScript={INJECTED_SCRIPT}
          originWhitelist={['*']}
          allowFileAccess={true}
          onNavigationStateChange={onNavigationStateChange}
        />
        <Button title="Hide modal" onPress={toggleModal} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
  },
});
