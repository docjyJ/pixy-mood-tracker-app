import { DATE_FORMAT } from "@/constants/Config";
import { askToCancel } from "@/helpers/prompts";
import { useBot } from "@/hooks/useBot";
import useColors from "@/hooks/useColors";
import { LogItem, useLogUpdater } from "@/hooks/useLogs";
import { useTemporaryLog } from "@/hooks/useTemporaryLog";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";
import { RootStackScreenProps } from "../../../types";
import { Answers } from "./Answers";
import { Header } from "./Header";
import { Message } from "./Message";
import { ThinkingBubble } from "./ThinkingBubble";

export const BotLogger = ({
  route
}: RootStackScreenProps<'BotLogger'>) => {
  const _id = useRef(uuidv4())
  const createdAt = useRef(dayjs().toISOString())

  const dateTime = route.params.dateTime;

  const initialItem = {
    id: _id.current,
    date: dateTime ? dayjs(dateTime).format(DATE_FORMAT) : dayjs().format(DATE_FORMAT),
    dateTime: dateTime,
    rating: null,
    message: '',
    emotions: [],
    tags: [],
    createdAt: createdAt.current,
  }

  return (
    <_BotLogger
      initialItem={initialItem}
    />
  )
}

const _BotLogger = ({
  initialItem
}: {
  initialItem: Omit<LogItem, 'rating'> & {
    rating: LogItem['rating'] | null
  }
}) => {
  const bot = useBot();
  const navigation = useNavigation()
  const inserts = useSafeAreaInsets()
  const colors = useColors()
  const logUpdater = useLogUpdater()
  const tempLog = useTemporaryLog(initialItem)

  const close = () => {
    console.log('close')
    navigation.goBack()
  }

  const onCancel = () => {
    if (tempLog.isDirty) {
      askToCancel().then(() => close()).catch(() => { })
    } else {
      close()
    }
  }

  const onClose = () => {
    close()
  }

  useEffect(() => {
    bot.on('save', () => {
      console.log(JSON.stringify(tempLog.data, null, 2))
      logUpdater.addLog(tempLog.data as LogItem)
    })

    bot.on('close', () => {
      onClose()
    })

    return () => {
      bot.off('save')
      bot.off('close')
    }
  }, [tempLog.data])

  useEffect(() => {
    bot.start()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colors.logBackground,
      }}
    >
      <Header onClose={onCancel} />
      {/* <View
        style={{
          padding: 16,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.text,
          }}
        >
          {JSON.stringify(tempLog.data, null, 2)}
        </Text>
      </View> */}
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            paddingBottom: inserts.bottom + 32,
          }}
        >
          <View
            style={{
              padding: 16,
            }}
          >
            {bot?.messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {bot.thinking && (
              <ThinkingBubble />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
            }}
          >
            {bot.answers.length > 0 && (
              <Answers
                answers={bot.answers}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
