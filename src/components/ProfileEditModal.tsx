import React, {useState, useEffect} from 'react';
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
import {User, UserSettings} from '../types';
import {COLORS} from '../constants';
import {Picker} from '@react-native-picker/picker';

interface ProfileEditModalProps {
  visible: boolean;
  user: User | null;
  settings: UserSettings | null;
  onSave: (userData: Partial<User>, settings: Partial<UserSettings>) => Promise<void>;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  user,
  settings,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [diabetesType, setDiabetesType] = useState<
    'type1' | 'type2' | 'prediabetes' | undefined
  >(user?.diabetesType);
  const [dailyGLTarget, setDailyGLTarget] = useState(
    settings?.dailyGLTarget?.toString() || '80',
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDiabetesType(user.diabetesType);
    }
    if (settings) {
      setDailyGLTarget(settings.dailyGLTarget.toString());
    }
  }, [user, settings]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          email: email.trim(),
          diabetesType,
        },
        {
          dailyGLTarget: parseInt(dailyGLTarget, 10) || 80,
        },
      );
      Alert.alert('성공', '프로필이 저장되었습니다.', [{text: '확인', onPress: onClose}]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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
            <Text style={styles.modalTitle}>프로필 편집</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={styles.label}>
                이름 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력하세요"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>당뇨 타입</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={diabetesType || ''}
                  onValueChange={(value) =>
                    setDiabetesType(value || undefined)
                  }
                  style={styles.picker}>
                  <Picker.Item label="선택 안함" value="" />
                  <Picker.Item label="1형 당뇨" value="type1" />
                  <Picker.Item label="2형 당뇨" value="type2" />
                  <Picker.Item label="전단계 당뇨" value="prediabetes" />
                </Picker>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>목표 일일 GL</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                value={dailyGLTarget}
                onChangeText={setDailyGLTarget}
                keyboardType="numeric"
              />
              <Text style={styles.hint}>기본값: 80 (조정 가능)</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.saveButton]}
              onPress={handleSave}
              disabled={saving || !name.trim()}>
              <Text style={styles.saveButtonText}>
                {saving ? '저장 중...' : '저장'}
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
  hint: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
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
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default ProfileEditModal;

