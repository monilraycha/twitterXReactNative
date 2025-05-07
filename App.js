// import React from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
//   Platform,
//   Linking,
//   TouchableOpacity,
// } from 'react-native';
// import { pipe, evolve } from 'ramda';
// import { Colors } from 'react-native/Libraries/NewAppScreen';
// import { InAppBrowser } from 'react-native-inappbrowser-reborn';
// import { v4 as uuid } from 'uuid';
// import querystring from 'query-string';
// import 'react-native-get-random-values';

// const AUTHORIZATION_URL = 'https://twitter.com/i/oauth2/authorize';
// const ACCESS_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
// const clientID = 'aXBZUWJtQ1VPb3p6blh3Z1VlVW86MTpjaQ'; // replace with your client ID
// const clientSecret = '****ObeRWg'; // replace with your client secret
// const redirectUri = 'https://erangad.github.io/TwitterOAuth';
// const permissions = ['offline.access', 'users.read'];

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   const getDeepLink = (path = '') => {
//     const scheme = 'my-scheme';
//     const prefix =
//       Platform.OS === 'android' ? `${scheme}://my-host/` : `${scheme}://`;
//     return prefix + path;
//   };

//   const cleanUrlString = (state) => state.replace('#!', '');

//   const getCodeAndStateFromUrl = pipe(
//     querystring.extract,
//     querystring.parse,
//     evolve({ state: cleanUrlString }),
//   );

//   const getPayloadForToken = ({
//     clientID,
//     clientSecret,
//     code,
//     redirectUriWithRedirectUrl,
//     currentAuthState,
//   }) =>
//     querystring.stringify({
//       grant_type: 'authorization_code',
//       code,
//       redirect_uri: redirectUriWithRedirectUrl,
//       client_id: clientID,
//       client_secret: clientSecret,
//       code_verifier: currentAuthState,
//     });

//   const fetchToken = async (payload) => {
//     const response = await fetch(ACCESS_TOKEN_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: payload,
//     });
//     return await response.json();
//   };

//   const getAccessToken = async (code, currentAuthState) => {
//     const deepLink = getDeepLink('callback');
//     const redirectUriWithRedirectUrl = `${redirectUri}?redirect_url=${encodeURIComponent(
//       deepLink,
//     )}`;
//     const payload = getPayloadForToken({
//       clientID,
//       clientSecret,
//       code,
//       redirectUriWithRedirectUrl,
//       currentAuthState,
//     });
//     const token = await fetchToken(payload);
//     if (token.error) {
//       return {};
//     }
//     return token;
//   };

//   const onLoginPressed = async () => {
//     const deepLink = getDeepLink('callback');
//     const authState = uuid();
//     const inappBorwserAuthURL = `${AUTHORIZATION_URL}?${querystring.stringify({
//       response_type: 'code',
//       client_id: clientID,
//       scope: permissions.join(' ').trim(),
//       state: authState,
//       redirect_uri: `${redirectUri}?redirect_url=${encodeURIComponent(
//         deepLink,
//       )}`,
//       code_challenge: authState,
//       code_challenge_method: 'plain',
//     })}`;

//     try {
//       if (await InAppBrowser.isAvailable()) {
//         InAppBrowser.openAuth(inappBorwserAuthURL, deepLink, {
//           ephemeralWebSession: false,
//           enableUrlBarHiding: true,
//           enableDefaultShare: false,
//         }).then(async (response) => {
//           const { code } = getCodeAndStateFromUrl(response.url);
//           const token = await getAccessToken(code, authState);
//           console.log('INFO::accessToken::response::', token);
//         });
//       } else {
//         Linking.openURL(inappBorwserAuthURL);
//       }
//     } catch (error) {
//       Linking.openURL(inappBorwserAuthURL);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.background}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <View style={{ justifyContent: 'center', alignItems: 'center' }}>
//         <TouchableOpacity onPress={onLoginPressed} style={styles.buttonStyle}>
//           <Text style = {{color:'white'}}>X Login</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   background: { flex: 1, justifyContent: 'center' },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   buttonStyle: {
//     height: 50,
//     width: '80%',
//     backgroundColor: 'black',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default App;


// App.js - Fixed Twitter Sign-in with Android Deep Links
import React, { useEffect } from 'react';
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
import { pipe, evolve } from 'ramda';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { v4 as uuid } from 'uuid';
import querystring from 'query-string';
import 'react-native-get-random-values';

const AUTHORIZATION_URL = 'https://twitter.com/i/oauth2/authorize';
const ACCESS_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const clientID = 'aXBZUWJtQ1VPb3p6blh3Z1VlVW86MTpjaQ'; // replace with your client ID
const clientSecret = '****ObeRWg'; // replace with your client secret
const redirectUri = 'https://erangad.github.io/TwitterOAuth';
const permissions = ['offline.access', 'users.read'];

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Handle deep links
  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = (event) => {
      const { url } = event;
      if (url) {
        handleUrlRedirect(url);
      }
    };

    // Add event listener for deep link handling
    const linkingListener = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleUrlRedirect(initialUrl);
      }
    }).catch(err => console.error('Error getting initial URL', err));

    return () => {
      // Clean up the event listener
      linkingListener.remove();
    };
  }, []);

  const handleUrlRedirect = async (url) => {
    console.log('Handling URL:', url);
    if (url && url.includes('callback')) {
      const { code, state } = getCodeAndStateFromUrl(url);
      console.log('URL redirect - Code:', code);
      console.log('URL redirect - State:', state);
      
      // if (!code) {
      //   console.error('No code found in URL');
      //   return;
      // }
      
      // if (!state || state !== currentAuthState) {
      //   console.error('State mismatch. Expected:', currentAuthState, 'Got:', state);
      //   return;
      // }
      
      const token = await getAccessToken(code, currentAuthState);
      console.log('INFO::accessToken::response::', token);
      
      if (token && token.access_token) {
        // Handle your successful login here
        console.log('Login successful!');
      } else {
        // console.error('Login failed - No access token received');
      }
    } else {
      console.log('URL does not contain callback parameter');
    }
  };

  const getDeepLink = (path = '') => {
    const scheme = 'my-scheme';
    // Standardize the deeplink format for both platforms
    return `${scheme}://${path}`;
  };

  const cleanUrlString = (state) => {
    if (!state) return '';
    return state.replace('#!', '');
  };

  const getCodeAndStateFromUrl = (url) => {
    try {
      // Extract the query part of the URL
      const queryPart = url.split('?')[1] || '';
      return querystring.parse(queryPart);
    } catch (error) {
      console.error('Error parsing URL:', error);
      return {};
    }
  };

  const getPayloadForToken = ({
    clientID,
    clientSecret,
    code,
    redirectUriWithRedirectUrl,
    currentAuthState,
  }) => {
    // Make sure we have valid parameters
    if (!code) {
      console.error('Missing code parameter');
    }
    if (!currentAuthState) {
      console.error('Missing auth state parameter');
    }
    
    // Twitter OAuth 2.0 requires these exact parameters
    return querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriWithRedirectUrl,
      client_id: clientID,
      client_secret: clientSecret,
      code_verifier: currentAuthState,
    });
  };

  const fetchToken = async (payload) => {
    try {
      console.log('Fetching token from:', ACCESS_TOKEN_URL);
      
      const response = await fetch(ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      });
      
      const responseText = await response.text();
      console.log('Token response status:', response.status);
      console.log('Token response headers:', JSON.stringify(response.headers));
      
      try {
        // Try to parse as JSON
        const responseJson = JSON.parse(responseText);
        console.log('Token response body:', JSON.stringify(responseJson));
        return responseJson;
      } catch (parseError) {
        console.error('Error parsing token response as JSON:', parseError);
        console.log('Raw token response:', responseText);
        return { error: 'invalid_response', error_description: 'Could not parse response as JSON' };
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      return { error: 'network_error', error_description: error.message };
    }
  };

  const getAccessToken = async (code, currentAuthState) => {
    const deepLink = getDeepLink('callback');
    const redirectUriWithRedirectUrl = `${redirectUri}?redirect_url=${encodeURIComponent(
      deepLink,
    )}`;
    
    // Debug info
    console.log('Code:', code);
    console.log('Auth State:', currentAuthState);
    console.log('Redirect URI:', redirectUriWithRedirectUrl);
    
    const payload = getPayloadForToken({
      clientID,
      clientSecret,
      code,
      redirectUriWithRedirectUrl,
      currentAuthState,
    });
    
    console.log('Token request payload:', payload);
    
    const token = await fetchToken(payload);
    if (token.error) {
      // console.error('Token error:', token.error);
      // console.error('Token error description:', token.error_description);
      return {};
    }
    return token;
  };

  // Store the auth state for verification later
  const [currentAuthState, setCurrentAuthState] = React.useState(null);
  
  const onLoginPressed = async () => {
    const deepLink = getDeepLink('callback');
    // Generate and store a new auth state for this login attempt
    const authState = uuid();
    setCurrentAuthState(authState);
    
    console.log('Generated auth state:', authState);
    console.log('Deep link for callback:', deepLink);
    
    // Define the redirect URI with the deep link
    const fullRedirectUri = `${redirectUri}?redirect_url=${encodeURIComponent(deepLink)}`;
    console.log('Full redirect URI:', fullRedirectUri);
    
    const inappBrowserAuthURL = `${AUTHORIZATION_URL}?${querystring.stringify({
      response_type: 'code',
      client_id: clientID,
      scope: permissions.join(' ').trim(),
      state: authState,
      redirect_uri: fullRedirectUri,
      code_challenge: authState,
      code_challenge_method: 'plain',  // Twitter OAuth 2.0 supports 'plain' method
    })}`;
    
    console.log('Auth URL:', inappBrowserAuthURL);

    try {
      if (await InAppBrowser.isAvailable()) {
        console.log('Using InAppBrowser');
        const result = await InAppBrowser.openAuth(inappBrowserAuthURL, deepLink, {
          ephemeralWebSession: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          showTitle: false,
          // Android specific
          navigationBarColor: 'black',
          toolbarColor: 'black',
          forceCloseOnRedirection: true, // Important for Android
        });
        
        console.log('InAppBrowser result type:', result.type);
        console.log('InAppBrowser result URL:', result.url);
        
        if (result.type === 'success' && result.url) {
          const { code, state } = getCodeAndStateFromUrl(result.url);
          console.log('Extracted code:', code);
          console.log('Extracted state:', state);
          
          // Verify the state matches before proceeding
          if (state && state === authState) {
            console.log('State verification passed');
            const token = await getAccessToken(code, authState);
            console.log('Token result:', token);
          } else {
            console.error('State verification failed. Expected:', authState, 'Got:', state);
          }
        } else {
          console.log('Auth was not successful or no URL was returned');
        }
      } else {
        console.log('Fallback to external browser');
        Linking.openURL(inappBrowserAuthURL);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback to external browser
      Linking.openURL(inappBrowserAuthURL);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <TouchableOpacity onPress={onLoginPressed} style={styles.buttonStyle}>
          <Text style={styles.buttonText}>X Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  container: {
    justifyContent: 'center', 
    alignItems: 'center'
  },
  buttonStyle: {
    height: 50,
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default App;