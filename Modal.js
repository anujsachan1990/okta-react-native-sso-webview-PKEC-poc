import React, {createRef} from 'react';
import {Button, StyleSheet, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import {WebView} from 'react-native-webview';

let webViewRef = createRef();

// const INJECTED_SCRIPT = `
// window.ReactNativeWebView.postMessage(document.cookie);
// const tokenLocalStorage = window.localStorage.getItem('okta-token-storage');
// window.ReactNativeWebView.postMessage(tokenLocalStorage);
// window.ReactNativeWebView.postMessage(window.sessionStorage.setItem('sessionToken','qwdqwdwqdqwdq'));
// `;

const injectTokenfunc = (idToken, accessToken) =>
  `setTimeout(()=>{
    const getSessionToken = JSON.parse(window.sessionStorage.getItem('persist:MOL_STORAGE'));
    const test = {
      ...JSON.parse(window.sessionStorage.getItem('persist:MOL_STORAGE')),
      ui: {
    authorization: {
     accessToken:'${accessToken}',
          idToken:'${idToken}'
            }
        }
    };
    const setSessionToken = window.sessionStorage.setItem('persist:MOL_STORAGE', JSON.stringify(test));
  const getSessionToken1 = window.sessionStorage.getItem('persist:MOL_STORAGE');
  window.ReactNativeWebView.postMessage(getSessionToken1);
  },2000)
  `;

// const injectTokenfunc = (idToken) =>
//   `const setSessionToken = window.sessionStorage.setItem('sessionToken','${idToken}');
//   const getSessionToken = window.sessionStorage.getItem('sessionToken');
//   window.ReactNativeWebView.postMessage(getSessionToken);`;

const INJECTED_SCRIPT = `
const idToken = JSON.parse(window.localStorage.getItem('okta-token-storage')).idToken.value;
const setSessionToken = window.sessionStorage.setItem('sessionToken',idToken);
const getSessionToken = window.sessionStorage.getItem('sessionToken');
window.ReactNativeWebView.postMessage(getSessionToken);
`;

export default function ModalBrowser({
  uri,
  content,
  onMessage,
  onNavigationStateChange,
  toggleModal,
  isModalVisible,
  idToken,
  accessToken,
}) {
  return (
    <SafeAreaView>
      <Modal isVisible={isModalVisible} style={styles.modalContainer}>
        <WebView
          ref={webViewRef}
          source={{
            uri,
            // headers: {'custom-app-header': 'react-native-ios-app'},
          }}
          onMessage={onMessage}
          startInLoadingState={true}
          javaScriptEnabled={true}
          sharedCookiesEnabled={true}
          //injectedJavaScript={INJECTED_SCRIPT}
          injectedJavaScript={injectTokenfunc(idToken, accessToken)}
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
