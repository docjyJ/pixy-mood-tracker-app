import _ from "lodash";
import { createContext, useContext, useState } from "react";
import { LogItem, useLogs } from './useLogs';
import { Tag } from "./useSettings";

const CalendarFiltersStateContext = createContext(undefined)

export type CalendarFiltersData = {
  text: string,
  ratings: LogItem['rating'][],
  tagIds: Tag['id'][],
  isOpen: boolean,
  filteredItems: LogItem[];
  filterCount: number;
  isFiltering: boolean;
}

type Value = {
  data: CalendarFiltersData;
  set: (data: CalendarFiltersData) => void;
  reset: () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  filterCount: number;
  isFiltering: boolean;
  filteredItems: LogItem[];
}

const initialState: CalendarFiltersData = {
  text: '',
  ratings: [],
  tagIds: [],
  isOpen: false,
  isFiltering: false,
  filterCount: 0,
  filteredItems: [],
}

function CalendarFiltersProvider({
  children
}: { 
  children: React.ReactNode 
}) {
  const logs = useLogs();
  const [data, setData] = useState<CalendarFiltersData>(initialState)
  const [isOpen, setIsOpen] = useState(false)

  const _validate = (item: LogItem, data: CalendarFiltersData) => {
    const matchesText = item.message.toLowerCase().includes(data.text.toLowerCase())
    const matchesRatings = data.ratings.includes(item.rating)
    const tagIds = item?.tags?.map(tag => tag.id)
    const matchesTags = _.difference(data.tagIds, tagIds).length === 0;

    const conditions = []

    if(data.text !== '') conditions.push(matchesText)
    if(data.ratings.length !== 0) conditions.push(matchesRatings)
    if(data.tagIds.length !== 0) conditions.push(matchesTags)

    return conditions.every(condition => condition)
  }
  
  const _setData = (data: CalendarFiltersData) => {
    const isFiltering = (
      data.text !== '' ||
      data.ratings.length !== 0 ||
      data.tagIds.length !== 0
    );
    
    const filteredItems = Object.entries(logs.state.items)
      .filter(([_, item]) => !_validate(item, data))
      .map(([_, item]) => item)

    const filterCount = (data.text !== '' ? 1 : 0) + data.ratings.length + data.tagIds.length;
      
    setData({
      ...data,
      filteredItems,
      isFiltering,
      filterCount,
    })
  }
  
  const value: Value = {
    data, 
    set: _setData,
    reset: () => setData(initialState),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    filteredItems: data.filteredItems,
    isFiltering: data.isFiltering,
    filterCount: data.filterCount,
    isOpen,
  };
  
  return (
    <CalendarFiltersStateContext.Provider value={value}>
      {children}
    </CalendarFiltersStateContext.Provider>
  )
}

function useCalendarFilters(): Value {
  const context = useContext(CalendarFiltersStateContext)
  if (context === undefined) {
    throw new Error('useCalendarFilters must be used within a CalendarFiltersProvider')
  }
  return context
}

export { CalendarFiltersProvider, useCalendarFilters };
