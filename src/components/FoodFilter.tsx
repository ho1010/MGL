import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FoodCategory, GLClassification, FoodSearchFilter} from '../types';
import {COLORS, FOOD_CATEGORIES, GL_LABEL_MAP} from '../constants';
import Slider from '@react-native-community/slider';

interface FoodFilterProps {
  filter: FoodSearchFilter;
  onFilterChange: (filter: FoodSearchFilter) => void;
  onReset: () => void;
}

const FoodFilter: React.FC<FoodFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [localFilter, setLocalFilter] = useState<FoodSearchFilter>(filter);

  const handleApply = () => {
    onFilterChange(localFilter);
    setShowModal(false);
  };

  const handleReset = () => {
    const resetFilter: FoodSearchFilter = {};
    setLocalFilter(resetFilter);
    onReset();
    setShowModal(false);
  };

  const toggleCategory = (category: FoodCategory) => {
    const categories = localFilter.categories || [];
    const updated = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setLocalFilter({...localFilter, categories: updated});
  };

  const toggleGLClassification = (classification: GLClassification) => {
    const classifications = localFilter.glClassification || [];
    const updated = classifications.includes(classification)
      ? classifications.filter((c) => c !== classification)
      : [...classifications, classification];
    setLocalFilter({...localFilter, glClassification: updated});
  };

  const activeFilterCount =
    (localFilter.categories?.length || 0) +
    (localFilter.glClassification?.length || 0) +
    (localFilter.giRange ? 1 : 0) +
    (localFilter.glRange ? 1 : 0);

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowModal(true)}>
        <Icon name="filter-list" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.filterButtonText}>필터</Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>필터</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* 카테고리 필터 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>카테고리</Text>
                <View style={styles.categoryGrid}>
                  {FOOD_CATEGORIES.map((category) => {
                    const isSelected = localFilter.categories?.includes(category);
                    return (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                        ]}
                        onPress={() => toggleCategory(category)}>
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextSelected,
                          ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* GL 분류 필터 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>GL 분류</Text>
                <View style={styles.classificationContainer}>
                  {(['SAFE', 'MODERATE', 'HIGH_RISK'] as GLClassification[]).map(
                    (classification) => {
                      const isSelected = localFilter.glClassification?.includes(
                        classification,
                      );
                      return (
                        <TouchableOpacity
                          key={classification}
                          style={[
                            styles.classificationChip,
                            isSelected && styles.classificationChipSelected,
                          ]}
                          onPress={() => toggleGLClassification(classification)}>
                          <Text
                            style={[
                              styles.classificationChipText,
                              isSelected && styles.classificationChipTextSelected,
                            ]}>
                            {GL_LABEL_MAP[classification]}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>

              {/* GI 범위 필터 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>GI 범위</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeRow}>
                    <Text style={styles.rangeLabel}>최소: {localFilter.giRange?.min || 0}</Text>
                    <Text style={styles.rangeLabel}>최대: {localFilter.giRange?.max || 100}</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={5}
                    value={localFilter.giRange?.max || 100}
                    onValueChange={(value) =>
                      setLocalFilter({
                        ...localFilter,
                        giRange: {
                          ...localFilter.giRange,
                          max: value,
                        },
                      })
                    }
                    minimumTrackTintColor={COLORS.PRIMARY}
                    maximumTrackTintColor={COLORS.BACKGROUND}
                  />
                </View>
              </View>

              {/* GL 범위 필터 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>GL 범위</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeRow}>
                    <Text style={styles.rangeLabel}>최소: {localFilter.glRange?.min || 0}</Text>
                    <Text style={styles.rangeLabel}>최대: {localFilter.glRange?.max || 50}</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={50}
                    step={5}
                    value={localFilter.glRange?.max || 50}
                    onValueChange={(value) =>
                      setLocalFilter({
                        ...localFilter,
                        glRange: {
                          ...localFilter.glRange,
                          max: value,
                        },
                      })
                    }
                    minimumTrackTintColor={COLORS.PRIMARY}
                    maximumTrackTintColor={COLORS.BACKGROUND}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.resetButton]}
                onPress={handleReset}>
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.applyButton]}
                onPress={handleApply}>
                <Text style={styles.applyButtonText}>적용</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    gap: 6,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.DANGER,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  categoryChipTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  classificationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  classificationChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  classificationChipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  classificationChipText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  classificationChipTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  rangeContainer: {
    marginTop: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BACKGROUND,
    paddingTop: 16,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.BACKGROUND,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default FoodFilter;

