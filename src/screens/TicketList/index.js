import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BaseScreen from '@layouts/BaseScreen';
import OfflineBanner from '@layouts/OfflineBanner';
import SearchBar from '@widgets/SearchBar';
import FilterChips from '@widgets/FilterChips';
import TicketListItem from '@widgets/TicketListItem';
import CustomButton from '@widgets/CustomButton';
import {
  TITLES,
  SCREEN_NAMES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  FILTER_ALL,
  SORT_ORDER,
  SEARCH_DEBOUNCE_MS,
  COLORS,
} from '@constants';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import {
  fetchTickets,
  fetchMoreTickets,
  setTicketQuery,
} from '@store/Tickets/actions';
import styles from './style';

const STATUS_OPTIONS = [
  { label: TITLES.FILTERS.STATUS_ALL, value: FILTER_ALL },
  { label: TITLES.FILTERS.STATUS_OPEN, value: TICKET_STATUS.OPEN },
  { label: TITLES.FILTERS.STATUS_IN_PROGRESS, value: TICKET_STATUS.IN_PROGRESS },
  { label: TITLES.FILTERS.STATUS_RESOLVED, value: TICKET_STATUS.RESOLVED },
];

const PRIORITY_OPTIONS = [
  { label: TITLES.FILTERS.PRIORITY_ALL, value: FILTER_ALL },
  { label: TITLES.FILTERS.PRIORITY_LOW, value: TICKET_PRIORITY.LOW },
  { label: TITLES.FILTERS.PRIORITY_MEDIUM, value: TICKET_PRIORITY.MEDIUM },
  { label: TITLES.FILTERS.PRIORITY_HIGH, value: TICKET_PRIORITY.HIGH },
];

const TicketList = ({ navigation }) => {
  const dispatch = useDispatch();
  const list = useSelector((state) => state?.tickets?.list);
  const [searchText, setSearchText] = useState(list?.query?.search || '');
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setTicketQuery({ search: debouncedSearch }));
    dispatch(fetchTickets());
  }, [debouncedSearch, dispatch]);

  const handleStatusFilter = useCallback(
    (value) => {
      dispatch(setTicketQuery({ statusFilter: value }));
      dispatch(fetchTickets());
    },
    [dispatch],
  );

  const handlePriorityFilter = useCallback(
    (value) => {
      dispatch(setTicketQuery({ priorityFilter: value }));
      dispatch(fetchTickets());
    },
    [dispatch],
  );

  const handleSortToggle = useCallback(() => {
    const newOrder =
      list?.query?.sortOrder === SORT_ORDER.NEWEST ? SORT_ORDER.OLDEST : SORT_ORDER.NEWEST;
    dispatch(setTicketQuery({ sortOrder: newOrder }));
    dispatch(fetchTickets());
  }, [dispatch, list?.query?.sortOrder]);

  const handleTicketPress = useCallback(
    (ticket) => {
      navigation.navigate(SCREEN_NAMES.TICKET_DETAILS, { ticketId: ticket?.id });
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.CREATE_TICKET);
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchTickets(true));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    dispatch(fetchMoreTickets());
  }, [dispatch]);

  const sortLabel = useMemo(
    () =>
      list?.query?.sortOrder === SORT_ORDER.NEWEST
        ? TITLES.TICKET_LIST.SORT_NEWEST
        : TITLES.TICKET_LIST.SORT_OLDEST,
    [list?.query?.sortOrder],
  );

  const renderItem = useCallback(
    ({ item }) => <TicketListItem ticket={item} onPress={handleTicketPress} />,
    [handleTicketPress],
  );

  const renderEmpty = () => {
    if (list?.isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.emptyText}>{TITLES.TICKET_LIST.LOADING}</Text>
        </View>
      );
    }
    if (debouncedSearch) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {`${TITLES.TICKET_LIST.NO_RESULTS} "${debouncedSearch}"`}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{TITLES.TICKET_LIST.EMPTY}</Text>
        <CustomButton title={TITLES.TICKET_LIST.EMPTY_CTA} onPress={handleCreate} />
      </View>
    );
  };

  const renderFooter = () => {
    if (list?.isLoadingMore) {
      return <ActivityIndicator style={styles.footer} color={COLORS.PRIMARY} />;
    }
    if (list?.page >= list?.totalPages && list?.items?.length > 0) {
      return <Text style={styles.footerText}>{TITLES.TICKET_LIST.NO_MORE}</Text>;
    }
    return null;
  };

  return (
    <BaseScreen>
      <OfflineBanner />
      <View style={styles.container}>
        <Text style={styles.title}>{TITLES.TICKET_LIST.TITLE}</Text>
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <FilterChips
          options={STATUS_OPTIONS}
          selectedValue={list?.query?.statusFilter}
          onSelect={handleStatusFilter}
        />
        <FilterChips
          options={PRIORITY_OPTIONS}
          selectedValue={list?.query?.priorityFilter}
          onSelect={handlePriorityFilter}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleSortToggle}
          accessibilityRole="button"
          accessibilityLabel={sortLabel}>
          <Text style={styles.sortText}>{sortLabel}</Text>
        </TouchableOpacity>
        <FlatList
          data={list?.items ?? []}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={list?.isRefreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </BaseScreen>
  );
};

export default TicketList;
