import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { memo, useCallback } from "react";
import { View } from "react-native";
import { useCalendarFilters } from "../hooks/useCalendarFilters";
import { LogItem } from "../hooks/useLogs";
import { SettingsState } from "../hooks/useSettings";
import CalendarDay from "./CalendarDay";

const CalendarDayContainer = ({ 
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <View style={{
      flex: 7,
      margin: 3,
    }}>{children}</View>
  )
}

type DayMapItem = {
  number: number;
  dateString: string;
  isToday: boolean;
  isFuture: boolean;
  hasText: boolean;
  isFiltered: boolean;
  isFiltering: boolean;
  hasContent: boolean;
  item: Omit<LogItem, 'tags'>;
}

export const CalendarWeek = memo(({
  days,
  items,
  isFirst = false,
  isLast = false,
  scaleType,
}: {
  days: string[];
  items: Omit<LogItem, 'tags'>[];
  onPress?: (dateString: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  scaleType: SettingsState["scaleType"];
}) => {
  let justifyContent = "space-around";
  if(isFirst) justifyContent = 'flex-end';
  if(isLast) justifyContent = 'flex-start';

  const navigation = useNavigation()
  const calendarFilters = useCalendarFilters();
  
  const emptyDays = [];
  for (let i = 0; i < 7 - days.length; i++) emptyDays.push(null);

  const daysMap: DayMapItem[] = days.map(dateString => {
    const day = dayjs(dateString);
    const item = items.find(item => item.date === dateString);
    const isFiltered = calendarFilters.filteredItems.map(item => item.date).includes(dateString);
    
    return {
      number: day.date(),
      dateString,
      item,
      isToday: dayjs(dateString).isSame(dayjs(), 'day'),
      isFuture: day.isAfter(dayjs()),
      isFiltered,
      isFiltering: calendarFilters.isFiltering,
      hasText: item?.message.length > 0,
      hasContent: (
        item?.message?.length > 0 ||
        item?.rating !== undefined
      ),
    }
  });
  
  const onPress = useCallback((day: DayMapItem) => {
    if(day.hasContent) {
      navigation.navigate('LogView', { date: day.dateString });
    } else {
      navigation.navigate('LogEdit', { date: day.dateString });
    }
  }, []);
  
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: 'space-around',
        marginLeft: -4,
        marginRight: -4,
      }}
    >
      {!isLast && emptyDays.map((day, index) => <CalendarDayContainer key={index} />)}

      {daysMap.map(day => (
        <CalendarDayContainer key={day.dateString}>
          <CalendarDay
            dateString={day.dateString}
            rating={day.item?.rating}
            day={day.number}
            isToday={day.isToday}
            isFiltered={day.isFiltered}
            isFiltering={day.isFiltering}
            isFuture={day.isFuture}
            hasText={day.item?.message?.length > 0}
            scaleType={scaleType}
            onPress={() => onPress(day)}
          />
        </CalendarDayContainer>)
      )}
      
      {isLast && emptyDays.map((day, index) => <CalendarDayContainer key={index} />)}
    </View>
  )
})
