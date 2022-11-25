import * as WebBrowser from 'expo-web-browser';
import { ScrollView, View } from 'react-native';
import { Shield } from 'react-native-feather';
import Markdown from 'react-native-markdown-display';
import LinkButton from '../components/LinkButton';
import useColors from '../hooks/useColors';
import { useAnalytics } from '../hooks/useAnalytics';
import { t } from '../helpers/translation';

export const PrivacyScreen = () => {
  const colors = useColors()
  const analytics = useAnalytics()

  const _handlePressButtonAsync = async () => {
    await WebBrowser.openBrowserAsync('https://pixy.day/privacy', {
      readerMode: true
    });
    analytics.track('privacy_policy_opened')
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView style={{
        padding: 16,
      }}>
        <View style={{
          paddingBottom: 80,
        }}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}>
            <Shield color={colors.text} width={80} height={30} />
          </View>
          {/* @ts-ignore */}
          <Markdown
            style={{
              body: { color: colors.text, fontSize: 16, lineHeight: 24 },
              heading3: { fontWeight: 'bold', fontSize: 21, lineHeight: 28, marginBottom: 0, marginTop: 20 },
              list_item: { marginTop: 5, marginLeft: -5 },
              bullet_list: { marginBottom: 10 },
              hr: { backgroundColor: colors.text, marginTop: 20, marginBottom: 20, opacity: 0.2 },
              em: { color: colors.text, opacity: 0.5, fontStyle: 'normal' },
            }}
            mar
          >
            {t('privacy_content')}
          </Markdown>

          <LinkButton
            style={{
              marginTop: 16,
            }}
            onPress={_handlePressButtonAsync}
          >{t('privacy_policy')}</LinkButton>
        </View>
      </ScrollView>
    </View>
  );
}
