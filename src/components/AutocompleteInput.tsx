import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FoodItem} from '../types';
import {COLORS} from '../constants';
import {searchService} from '../services/searchService';

interface AutocompleteInputProps {
  placeholder?: string;
  onSelect: (food: FoodItem) => void;
  onTextChange?: (text: string) => void;
  debounceMs?: number;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  placeholder = '음식명을 입력하세요...',
  onSelect,
  onTextChange,
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchService.getAutocompleteSuggestions(query, 10);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('자동완성 오류:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    if (onTextChange) {
      onTextChange(query);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, onTextChange]);

  const handleSelect = (food: FoodItem) => {
    setQuery(food.nameKo);
    setShowSuggestions(false);
    onSelect(food);
    searchService.saveRecentSearch(food.nameKo);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const renderSuggestion = ({item}: {item: FoodItem}) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelect(item)}>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.nameKo}</Text>
        {item.nameEn && (
          <Text style={styles.suggestionNameEn}>{item.nameEn}</Text>
        )}
      </View>
      <View style={styles.suggestionMeta}>
        <Text style={styles.suggestionGL}>GL: {item.calculatedGL}</Text>
        <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="search" size={24} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {loading && (
          <ActivityIndicator size="small" color={COLORS.PRIMARY} style={styles.loader} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Icon name="close" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      )}

      {showSuggestions && suggestions.length === 0 && query.length > 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    elevation: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  suggestionNameEn: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionGL: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  noResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginTop: 4,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1001,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default AutocompleteInput;

