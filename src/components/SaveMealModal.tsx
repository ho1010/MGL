import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FoodItem, MealType} from '../types';
import {COLORS} from '../constants';

interface SaveMealModalProps {
  visible: boolean;
  foods: FoodItem[];
  totalGL: number;
  onSave: (mealType: MealType, notes?: string) => void;
  onCancel: () => void;
}

const SaveMealModal: React.FC<SaveMealModalProps> = ({
  visible,
  foods,
  totalGL,
  onSave,
  onCancel,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [notes, setNotes] = useState('');

  const mealTypes: {type: MealType; label: string; icon: string}[] = [
    {type: 'breakfast', label: '아침', icon: 'wb-sunny'},
    {type: 'lunch', label: '점심', icon: 'restaurant'},
    {type: 'dinner', label: '저녁', icon: 'dinner-dining'},
    {type: 'snack', label: '간식', icon: 'cake'},
  ];

  const handleSave = () => {
    onSave(selectedMealType, notes.trim() || undefined);
    setNotes('');
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
            <Text style={styles.modalTitle}>식사 기록 저장</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* 음식 목록 */}
            <View style={styles.foodsSection}>
              <Text style={styles.sectionTitle}>인식된 음식</Text>
              {foods.map((food) => (
                <View key={food.id} style={styles.foodItem}>
                  <Text style={styles.foodName}>{food.nameKo}</Text>
                  <Text style={styles.foodGL}>GL: {food.calculatedGL}</Text>
                </View>
              ))}
              <View style={styles.totalGLContainer}>
                <Text style={styles.totalGL}>총 GL: {totalGL}</Text>
              </View>
            </View>

            {/* 식사 타입 선택 */}
            <View style={styles.mealTypeSection}>
              <Text style={styles.sectionTitle}>식사 타입</Text>
              <View style={styles.mealTypeGrid}>
                {mealTypes.map((meal) => (
                  <TouchableOpacity
                    key={meal.type}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === meal.type &&
                        styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setSelectedMealType(meal.type)}>
                    <Icon
                      name={meal.icon}
                      size={24}
                      color={
                        selectedMealType === meal.type
                          ? COLORS.WHITE
                          : COLORS.TEXT_PRIMARY
                      }
                    />
                    <Text
                      style={[
                        styles.mealTypeLabel,
                        selectedMealType === meal.type &&
                          styles.mealTypeLabelActive,
                      ]}>
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 메모 */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>메모 (선택)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="식사에 대한 메모를 입력하세요..."
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* 버튼 */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>저장</Text>
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  foodsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  foodName: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  foodGL: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  totalGLContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.PRIMARY,
  },
  totalGL: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'right',
  },
  mealTypeSection: {
    marginBottom: 24,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 8,
  },
  mealTypeLabelActive: {
    color: COLORS.WHITE,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default SaveMealModal;

