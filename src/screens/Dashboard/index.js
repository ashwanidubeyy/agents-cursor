import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BaseScreen from '@layouts/BaseScreen';
import OfflineBanner from '@layouts/OfflineBanner';
import AnalyticsCard from '@widgets/AnalyticsCard';
import CustomButton from '@widgets/CustomButton';
import { TITLES, SCREEN_NAMES, COLORS, TEST_IDS } from '@constants';
import { useAnalyticsPolling } from '@hooks/useAnalyticsPolling';
import { fetchAnalytics } from '@store/Tickets/actions';
import styles from './style';

const Dashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const analytics = useSelector((state) => state?.tickets?.analytics);

  useAnalyticsPolling();

  const handleRefresh = useCallback(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleViewAll = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.TICKET_LIST);
  }, [navigation]);

  const handleCreate = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.CREATE_TICKET);
  }, [navigation]);

  return (
    <BaseScreen>
      <OfflineBanner />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={analytics?.isLoading} onRefresh={handleRefresh} />
        }>
        <Text style={styles.title} testID={TEST_IDS.DASHBOARD.TITLE}>
          {TITLES.DASHBOARD.TITLE}
        </Text>
        <View style={styles.grid}>
          <AnalyticsCard
            label={TITLES.DASHBOARD.OPEN_TICKETS}
            value={analytics?.openCount}
            accentColor={COLORS.STATUS_OPEN}
          />
          <AnalyticsCard
            label={TITLES.DASHBOARD.ASSIGNED_TO_ME}
            value={analytics?.assignedToMe}
            accentColor={COLORS.PRIMARY}
          />
          <AnalyticsCard
            label={TITLES.DASHBOARD.RESOLVED_TODAY}
            value={analytics?.resolvedToday}
            accentColor={COLORS.STATUS_RESOLVED}
          />
          <AnalyticsCard
            label={TITLES.DASHBOARD.HIGH_PRIORITY}
            value={analytics?.highPriority}
            accentColor={COLORS.PRIORITY_HIGH}
          />
        </View>
        <CustomButton title={TITLES.DASHBOARD.VIEW_ALL} onPress={handleViewAll} />
        <View style={styles.spacer} />
        <CustomButton
          title={TITLES.DASHBOARD.CREATE_TICKET}
          onPress={handleCreate}
          testID={TEST_IDS.DASHBOARD.CREATE_TICKET}
        />
      </ScrollView>
    </BaseScreen>
  );
};

export default Dashboard;
