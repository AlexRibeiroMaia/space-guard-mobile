import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { SG } from '@/constants/colors';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <WebNavBar>
          <TabTrigger name="home" href="/" asChild>
            <NavButton>Home</NavButton>
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <NavButton>Chat IA</NavButton>
          </TabTrigger>
          <TabTrigger name="risco" href="/risco" asChild>
            <NavButton>Risco</NavButton>
          </TabTrigger>
          <TabTrigger name="campo" href="/campo" asChild>
            <NavButton>Campo</NavButton>
          </TabTrigger>
        </WebNavBar>
      </TabList>
    </Tabs>
  );
}

function NavButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.navButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function WebNavBar(props: TabListProps) {
  return (
    <View {...props} style={styles.navBarContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          SPACE GUARD
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: SG.surface,
    borderBottomWidth: 1,
    borderBottomColor: SG.border,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  navButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
