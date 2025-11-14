import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FoodCategory, FOOD_CATEGORIES} from '../types';
import {COLORS} from '../constants';
import {foodSuggestionService} from '../services/foodSuggestionService';
import {Picker} from '@react-native-picker/picker';

interface FoodSuggestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FoodSuggestionModal: React.FC<FoodSuggestionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [glycemicIndex, setGlycemicIndex] = useState('');
  const [carbohydratesPer100g, setCarbohydratesPer100g] = useState('');
  const [standardServingSize, setStandardServingSize] = useState('100');
  const [category, setCategory] = useState<FoodCategory>('기타');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nameKo.trim()) {
      Alert.alert('오류', '음식명(한글)을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await foodSuggestionService.submitSuggestion({
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim() || undefined,
        glycemicIndex: glycemicIndex ? parseFloat(glycemicIndex) : undefined,
        carbohydratesPer100g: carbohydratesPer100g
          ? parseFloat(carbohydratesPer100g)
          : undefined,
        standardServingSize: standardServingSize
          ? parseFloat(standardServingSize)
          : undefined,
        category,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        '제출 완료',
        '음식 정보가 제출되었습니다. 관리자 검토 후 데이터베이스에 추가됩니다.',
        [
          {
            text: '확인',
            onPress: () => {
              handleReset();
              onClose();
              if (onSuccess) onSuccess();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setNameKo('');
    setNameEn('');
    setGlycemicIndex('');
    setCarbohydratesPer100g('');
    setStandardServingSize('100');
    setCategory('기타');
    setNotes('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>음식 정보 제안</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={styles.label}>
                음식명 (한글) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="예: 김치볶음밥"
                value={nameKo}
                onChangeText={setNameKo}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>음식명 (영문)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: Kimchi Fried Rice"
                value={nameEn}
                onChangeText={setNameEn}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  style={styles.picker}>
                  {FOOD_CATEGORIES.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.section, styles.halfSection]}>
                <Text style={styles.label}>GI (혈당지수)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 73"
                  value={glycemicIndex}
                  onChangeText={setGlycemicIndex}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.section, styles.halfSection]}>
                <Text style={styles.label}>탄수화물 (100g당)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 28"
                  value={carbohydratesPer100g}
                  onChangeText={setCarbohydratesPer100g}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>표준 섭취량 (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 150"
                value={standardServingSize}
                onChangeText={setStandardServingSize}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>메모</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="추가 정보나 출처를 입력하세요..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.infoText}>
                제출된 정보는 관리자 검토 후 데이터베이스에 추가됩니다.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={submitting || !nameKo.trim()}>
              <Text style={styles.submitButtonText}>
                {submitting ? '제출 중...' : '제출'}
              </Text>
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
    maxHeight: '90%',
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
    marginBottom: 20,
  },
  halfSection: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  required: {
    color: COLORS.DANGER,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
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
  cancelButton: {
    backgroundColor: COLORS.BACKGROUND,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default FoodSuggestionModal;

