import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {FoodItem} from '../types';
import {COLORS, GL_LABEL_MAP} from '../constants';
import {GLSafetyLevel} from '../constants';
import {getGLSafetyLevel} from '../utils/glCalculator';
import GLBadge from './GLBadge';

interface FoodSelectionModalProps {
  visible: boolean;
  detectedFoodName: string;
  foodOptions: FoodItem[];
  onSelect: (food: FoodItem) => void;
  onCancel: () => void;
}

const FoodSelectionModal: React.FC<FoodSelectionModalProps> = ({
  visible,
  detectedFoodName,
  foodOptions,
  onSelect,
  onCancel,
}) => {
  const renderFoodOption = ({item}: {item: FoodItem}) => {
    const safetyLevel = getGLSafetyLevel(item.calculatedGL);

    return (
      <TouchableOpacity
        style={styles.foodOption}
        onPress={() => onSelect(item)}>
        <View style={styles.foodOptionHeader}>
          <View style={styles.foodOptionNameContainer}>
            <Text style={styles.foodOptionName}>{item.nameKo}</Text>
            <Text style={styles.foodOptionNameEn}>{item.nameEn}</Text>
          </View>
          <GLBadge gl={item.calculatedGL} safetyLevel={safetyLevel} />
        </View>
        <View style={styles.foodOptionInfo}>
          <Text style={styles.foodOptionInfoText}>
            GI: {item.glycemicIndex} | 탄수화물: {item.carbohydratesPer100g}g/100g
          </Text>
          <Text style={styles.foodOptionInfoText}>
            제공량: {item.standardServingSize}g | {GL_LABEL_MAP[safetyLevel]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              "{detectedFoodName}"에 대한 검색 결과
            </Text>
            <Text style={styles.modalSubtitle}>
              가장 적합한 음식을 선택해주세요
            </Text>
          </View>

          {foodOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                매칭되는 음식을 찾을 수 없습니다.
              </Text>
            </View>
          ) : (
            <FlatList
              data={foodOptions}
              renderItem={renderFoodOption}
              keyExtractor={(item) => item.id}
              style={styles.foodList}
              contentContainerStyle={styles.foodListContent}
            />
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  foodList: {
    flex: 1,
  },
  foodListContent: {
    padding: 16,
  },
  foodOption: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
  },
  foodOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodOptionNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  foodOptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  foodOptionNameEn: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  foodOptionInfo: {
    gap: 4,
  },
  foodOptionInfoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.BACKGROUND,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
});

export default FoodSelectionModal;

