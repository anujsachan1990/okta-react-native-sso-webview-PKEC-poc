import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Button,
} from 'react-native';

import ModalBrowser from './Modal';

const gup = (name, url) => {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regexS = '[\\?&]' + name + '=([^&#]*)';
  const regex = new RegExp(regexS);
  const results = regex.exec(url);
  return results == null ? null : results[1];
};

const App = () => {
  const [hasOpenPortal, setOpenPortal] = useState(false);
  const [hasOpenLogout, setOpenLogout] = useState(false);
  const [isOpen, setIsOpenpen] = useState(false);

  const [accessToken, setAccessToken] = useState('');
  const [idToken, setIDToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const toggleModal = () => {
    setIsOpenpen(!isOpen);
  };

  const logout = () => {
    setOpenLogout(!hasOpenLogout);
    // clear tokens from KeyChain
    setAccessToken('');
    setIDToken('');
    setRefreshToken('');
  };
  const togglePortalLink = () => {
    setOpenPortal(!hasOpenPortal);
  };

  const onNavigationStateChange = async (webViewState: {url: string}) => {
    const {url} = webViewState;
    console.log('url', url);
    if (!!gup('state', url) && !!gup('code', url)) {
      const code = gup('code', url);
      const state = gup('state', url);
      // console.log('code', code);
      // console.log('state', state);
      setIsOpenpen(false);
      const details = {
        client_id: '0oa54jk8kqn7DfAqV5d6',
        code_verifier:
          'M25iVXpKU3puUjFaYWg3T1NDTDQtcW1ROUY5YXlwalNoc0hhakxifmZHag',
        redirect_uri: 'https://okta-cli-react-webapp.vercel.app',
        grant_type: 'authorization_code',
        code,
        state,
      };
      console.log();
      if (!accessToken && !idToken && !refreshToken) {
        const searchParams = Object.keys(details)
          .map((key) => {
            return (
              encodeURIComponent(key) + '=' + encodeURIComponent(details[key])
            );
          })
          .join('&');

        fetch('https://dev-3976672.okta.com/oauth2/default/v1/token', {
          method: 'post',
          body: searchParams,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        }).then((response) => {
          response.json().then(async (res) => {
            // store tokens in keychain access
            await setAccessToken(res.access_token);
            await setIDToken(res.id_token);
            await setRefreshToken(res.refresh_token);
          });
        });
      }
    }
  };

  const onMessage = async (event, callback) => {
    const {data} = event.nativeEvent;
    console.log('data', data);
  };

  const onLogout = async (event, callback) => {
    setOpenLogout(false);
    setAccessToken('');
    setIDToken('');
    setRefreshToken('');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {!accessToken && !idToken && (
            <Button title="Login" onPress={toggleModal} />
          )}

          {!!accessToken && !!idToken && (
            <>
              <Button title="Open profile" onPress={togglePortalLink} />
              <Button title="Sign out" onPress={logout} />
            </>
          )}

          {!!accessToken && (
            <>
              <Text style={styles.title}>Access Token</Text>
              <View style={styles.tokens}>
                <Text style={styles.tokensValue}>{accessToken}</Text>
              </View>
            </>
          )}
          {!!idToken && (
            <>
              <Text style={styles.title}>ID Token</Text>
              <View style={styles.tokens}>
                <Text style={styles.tokensValue}>{idToken}</Text>
              </View>
            </>
          )}
          {!!refreshToken && (
            <>
              <Text style={styles.title}>refreshToken</Text>
              <View style={styles.tokens}>
                <Text style={styles.tokensValue}>{refreshToken}</Text>
              </View>
            </>
          )}
        </ScrollView>

        <ModalBrowser
          uri={
            'https://dev-3976672.okta.com/oauth2/default/v1/authorize?client_id=0oa54jk8kqn7DfAqV5d6&response_type=code&scope=openid%20offline_access&redirect_uri=https://okta-cli-react-webapp.vercel.app&state=237c671a-29d7-11eb-adc1-0242ac120002&code_challenge_method=S256&code_challenge=qjrzSW9gMiUgpUvqgEPE4_-8swvyCtfOVvg55o5S_es'
          }
          // uri={'https://okta-cli-react-webapp.vercel.app'}
          isModalVisible={isOpen}
          onNavigationStateChange={onNavigationStateChange}
          onMessage={onMessage}
          toggleModal={toggleModal}
        />

        <ModalBrowser
          uri={'https://okta-cli-react-webapp.vercel.app/profile'}
          // uri={'https://oktapoc.herokuapp.com/dashboard'}
          isModalVisible={hasOpenPortal}
          toggleModal={togglePortalLink}
          idToken={idToken}
        />

        <ModalBrowser
          uri={'https://dev-3976672.okta.com/login/signout'}
          isModalVisible={hasOpenLogout}
          toggleModal={logout}
          onMessage={onLogout}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
  },
  tokens: {
    marginBottom: 30,
    backgroundColor: '#eee',
    padding: 20,
  },
  tokensValue: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    alignContent: 'center',
    margin: 10,
  },
});

export default App;
