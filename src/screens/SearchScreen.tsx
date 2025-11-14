import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootStackParamList} from '../navigation/AppNavigator';
import {FoodItem, FoodSearchFilter} from '../types';
import {COLORS} from '../constants';
import AutocompleteInput from '../components/AutocompleteInput';
import FoodFilter from '../components/FoodFilter';
import FoodItemCard from '../components/FoodItemCard';
import {searchService} from '../services/searchService';
import {RootState} from '../store/store';
import {useSelector} from 'react-redux';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FoodSearchFilter>({});
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'recent'>('search');

  // 즐겨찾기 및 최근 조회 로드
  useEffect(() => {
    loadFavorites();
    loadRecentFoods();
    loadRecentSearches();
  }, []);

  // 검색 실행
  useEffect(() => {
    if (activeTab === 'search') {
      performSearch();
    }
  }, [searchQuery, filter, activeTab]);

  const loadFavorites = async () => {
    const favoriteIds = await searchService.getFavorites();
    setFavorites(favoriteIds);
    
    if (favoriteIds.length > 0) {
      const allFoods = await searchService.searchFoods({});
      const favoriteFoods = allFoods.filter((f) => favoriteIds.includes(f.id));
      setResults(favoriteFoods);
    }
  };

  const loadRecentFoods = async () => {
    const recentIds = await searchService.getRecentFoods();
    if (recentIds.length > 0) {
      const allFoods = await searchService.searchFoods({});
      const recentFoodItems = recentIds
        .map((id) => allFoods.find((f) => f.id === id))
        .filter((f): f is FoodItem => f !== undefined);
      setRecentFoods(recentFoodItems);
    }
  };

  const loadRecentSearches = async () => {
    const searches = await searchService.getRecentSearches();
    setRecentSearches(searches);
  };

  const performSearch = async () => {
    if (!searchQuery.trim() && Object.keys(filter).length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchFilter: FoodSearchFilter = {
        ...filter,
        query: searchQuery.trim() || undefined,
      };
      const searchResults = await searchService.searchFoods(searchFilter);
      setResults(searchResults);
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await performSearch();
    await loadFavorites();
    await loadRecentFoods();
    setRefreshing(false);
  };

  const handleFoodSelect = async (food: FoodItem) => {
    await searchService.saveRecentFood(food.id);
    navigation.navigate('GLCalculation', {food});
  };

  const handleToggleFavorite = async (foodId: string) => {
    const isFavorite = favorites.includes(foodId);
    if (isFavorite) {
      await searchService.removeFavorite(foodId);
    } else {
      await searchService.addFavorite(foodId);
    }
    await loadFavorites();
  };

  const handleRecentSearchSelect = async (query: string) => {
    setSearchQuery(query);
    await searchService.saveRecentSearch(query);
  };

  const handleFilterChange = (newFilter: FoodSearchFilter) => {
    setFilter(newFilter);
  };

  const handleFilterReset = () => {
    setFilter({});
  };

  const renderFoodItem = ({item}: {item: FoodItem}) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <View style={styles.foodItemWrapper}>
        <FoodItemCard food={item} onPress={() => handleFoodSelect(item)} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.id)}>
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={isFavorite ? COLORS.DANGER : COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentSearch = (query: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchSelect(query)}>
      <Icon name="history" size={20} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.recentSearchText}>{query}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (activeTab === 'search') {
      if (searchQuery.trim() || Object.keys(filter).length > 0) {
        return (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            <Text style={styles.emptySubtext}>
              다른 검색어나 필터를 시도해보세요
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>음식을 검색해보세요</Text>
          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>최근 검색어</Text>
              <View style={styles.recentSearchesList}>
                {recentSearches.slice(0, 5).map((query, index) =>
                  renderRecentSearch(query, index),
                )}
              </View>
            </View>
          )}
        </View>
      );
    }

    if (activeTab === 'favorites') {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>즐겨찾기가 없습니다</Text>
          <Text style={styles.emptySubtext}>
            음식 카드를 길게 눌러 즐겨찾기에 추가하세요
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="history" size={64} color={COLORS.TEXT_SECONDARY} />
        <Text style={styles.emptyText}>최근 조회한 음식이 없습니다</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 검색 헤더 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <AutocompleteInput
            placeholder="음식명을 검색하세요..."
            onSelect={handleFoodSelect}
            onTextChange={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          <FoodFilter
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </View>
      </View>

      {/* 탭 선택 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'search' && styles.tabTextActive,
            ]}>
            검색
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => {
            setActiveTab('favorites');
            loadFavorites();
          }}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'favorites' && styles.tabTextActive,
            ]}>
            즐겨찾기 ({favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
          onPress={() => {
            setActiveTab('recent');
            loadRecentFoods();
          }}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'recent' && styles.tabTextActive,
            ]}>
            최근 조회
          </Text>
        </TouchableOpacity>
      </View>

      {/* 결과 목록 */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'favorites'
              ? results.filter((f) => favorites.includes(f.id))
              : activeTab === 'recent'
              ? recentFoods
              : results
          }
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            results.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  searchContainer: {
    marginBottom: 12,
  },
  filterContainer: {
    alignItems: 'flex-start',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  foodItemWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    marginTop: 32,
    width: '100%',
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  recentSearchesList: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  recentSearchText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default SearchScreen;

