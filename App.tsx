import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {pipe, evolve} from 'ramda';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {v4 as uuid} from 'uuid';
import querystring from 'query-string';
import 'react-native-get-random-values';

const AUTHORIZATION_URL = 'https://twitter.com/i/oauth2/authorize';
const ACCESS_TOKEN_URL: string = 'https://api.twitter.com/2/oauth2/token';
const clientID = ''; // replace your client ID here
const clientSecret = ''; // replace your client secret here
const redirectUri = 'https://erangad.github.io/TwitterOAuth';
const permissions = ['offline.access', 'users.read'];

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getDeepLink = (path = '') => {
    const scheme = 'my-scheme';
    const prefix =
      Platform.OS == 'android' ? `${scheme}://my-host/` : `${scheme}://`;
    return prefix + path;
  };

  const cleanUrlString = (state: string) => state.replace('#!', '');

  const getCodeAndStateFromUrl = pipe(
    querystring.extract,
    querystring.parse,
    evolve({state: cleanUrlString}),
  );

  const getPayloadForToken = ({
    clientID,
    clientSecret,
    code,
    redirectUriWithRedirectUrl,
    currentAuthState,
  }: {
    code: string;
    clientID: string;
    clientSecret?: string;
    redirectUriWithRedirectUrl: string;
    permissions?: string[];
    currentAuthState?: string;
  }) =>
    querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriWithRedirectUrl,
      client_id: clientID,
      client_secret: clientSecret,
      code_verifier: currentAuthState,
    });

  const fetchToken = async (payload: any) => {
    const response = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });
    return await response.json();
  };

  const getAccessToken = async (code: string, currentAuthState: string) => {
    const deepLink = getDeepLink('callback');
    const redirectUriWithRedirectUrl = `${redirectUri}?redirect_url=${encodeURIComponent(
      deepLink,
    )}`;
    const payload: string = getPayloadForToken({
      clientID,
      clientSecret,
      code,
      redirectUriWithRedirectUrl,
      currentAuthState,
    });
    const token = await fetchToken(payload);
    if (token.error) {
      return {};
    }
    return token;
  };

  const onLoginPressed = async () => {
    const deepLink = getDeepLink('callback');
    const authState = uuid();
    const inappBorwserAuthURL = `${AUTHORIZATION_URL}?${querystring.stringify({
      response_type: 'code',
      client_id: clientID,
      scope: permissions!.join(' ').trim(),
      state: authState,
      redirect_uri: `${redirectUri}?redirect_url=${encodeURIComponent(
        deepLink,
      )}`,
      code_challenge: authState,
      code_challenge_method: 'plain',
    })}`;

    try {
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(inappBorwserAuthURL, deepLink, {
          ephemeralWebSession: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        }).then(async (response: any) => {
          const {code} = getCodeAndStateFromUrl(response.url);
          const token = await getAccessToken(code, authState);
          console.log('INFO::accessToken::response::', token); // this is the access token received
        });
      } else {
        Linking.openURL(inappBorwserAuthURL); // in case any error try to open the inbuilt browser
      }
    } catch (error) {
      Linking.openURL(inappBorwserAuthURL); // in case any error try to open the inbuilt browser
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={onLoginPressed} style={styles.buttonStyle}>
          <Text>X Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {flex: 1, justifyContent: 'center'},
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  buttonStyle: {
    height: 100,
    width: 100,
    backgroundColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
