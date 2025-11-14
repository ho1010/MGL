import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {analyzeFoodImage, selectFoodForDetected} from '../store/slices/foodSlice';
import {saveMealRecord, loadAllMealRecords} from '../store/slices/mealSlice';
import {RootState} from '../store/store';
import {MealType} from '../types';
import MealTypeSelector from '../components/MealTypeSelector';
import {COLORS} from '../constants';
import {
  calculateTotalGL,
  getGLSafetyLevel,
  getGLSafetyMessage,
} from '../utils/glCalculator';
import {GL_COLOR_MAP} from '../constants';
import FoodSelectionModal from '../components/FoodSelectionModal';
import FoodItemCard from '../components/FoodItemCard';
import SaveMealModal from '../components/SaveMealModal';
import {saveMealRecord} from '../store/slices/mealSlice';
import {MealType} from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CameraScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const {
    detectedFoods,
    detectedFoodsRaw,
    loading,
    error,
    pendingSelections,
  } = useSelector((state: RootState) => state.food);
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // 에러 처리
  useEffect(() => {
    if (error) {
      Alert.alert('오류', error, [
        {
          text: '확인',
          onPress: () => {
            // 에러 상태 초기화는 Redux에서 처리
          },
        },
      ]);
    }
  }, [error]);

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: true, // base64 포함
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          if (response.errorMessage) {
            Alert.alert('오류', response.errorMessage);
          }
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const uri = asset.uri;
          if (uri) {
            setImageUri(uri);
            // base64가 있으면 사용 (data:image/jpeg;base64, 형식으로 전달)
            // 없으면 URI 사용
            const imageData = asset.base64
              ? `data:image/jpeg;base64,${asset.base64}`
              : uri;
            dispatch(analyzeFoodImage(imageData) as any);
          }
        }
      },
    );
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: true, // base64 포함
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          if (response.errorMessage) {
            Alert.alert('오류', response.errorMessage);
          }
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const uri = asset.uri;
          if (uri) {
            setImageUri(uri);
            // base64가 있으면 사용 (data:image/jpeg;base64, 형식으로 전달)
            // 없으면 URI 사용
            const imageData = asset.base64
              ? `data:image/jpeg;base64,${asset.base64}`
              : uri;
            dispatch(analyzeFoodImage(imageData) as any);
          }
        }
      },
    );
  };

  const handleFoodSelect = (detectedFoodName: string, selectedFood: any) => {
    dispatch(
      selectFoodForDetected({
        detectedFoodName,
        selectedFood,
      }),
    );
    setSelectedFoodIndex(null);
  };

  const handleRetakePhoto = () => {
    setImageUri(null);
    setSelectedFoodIndex(null);
  };

  const handleSaveMeal = (mealType: MealType, notes?: string) => {
    if (detectedFoods.length === 0) {
      Alert.alert('오류', '저장할 음식이 없습니다.');
      return;
    }

    try {
      await dispatch(
        saveMealRecord({
          mealType,
          foods: detectedFoods,
          notes,
          imageUrl: imageUri || undefined,
        }) as any,
      );

      // 기록 목록 새로고침
      dispatch(loadAllMealRecords() as any);

      setShowSaveModal(false);
      Alert.alert('성공', '식사 기록이 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 기록 화면으로 이동하거나 화면 초기화
            handleRetakePhoto();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '식사 기록 저장에 실패했습니다.');
    }
  };

  const totalGL = calculateTotalGL(detectedFoods);
  const safetyLevel = getGLSafetyLevel(totalGL);
  const safetyMessage = getGLSafetyMessage(totalGL);

  // 선택 대기 중인 음식이 있는지 확인
  const hasPendingSelections = pendingSelections.length > 0;

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>
            음식 사진을 촬영하거나 선택하세요
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
              <Text style={styles.buttonText}>카메라로 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handlePickImage}>
              <Text style={styles.buttonText}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{uri: imageUri}} style={styles.image} />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>이미지 분석 중...</Text>
              <Text style={styles.loadingSubtext}>
                AI가 음식을 인식하고 있습니다
              </Text>
            </View>
          ) : detectedFoods.length > 0 || hasPendingSelections ? (
            <ScrollView style={styles.analysisResult}>
              {detectedFoods.length > 0 && (
                <>
                  <View
                    style={[
                      styles.glBadge,
                      {backgroundColor: GL_COLOR_MAP[safetyLevel]},
                    ]}>
                    <Text style={styles.glValue}>총 GL: {totalGL}</Text>
                    <Text style={styles.glMessage}>{safetyMessage}</Text>
                  </View>

                  <Text style={styles.foodListTitle}>인식된 음식:</Text>
                  {detectedFoods.map((food) => (
                    <FoodItemCard key={food.id} food={food} />
                  ))}
                </>
              )}

              {hasPendingSelections && (
                <View style={styles.pendingSection}>
                  <Text style={styles.pendingTitle}>
                    음식 선택이 필요합니다 ({pendingSelections.length}개)
                  </Text>
                  {pendingSelections.map((pending, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pendingItem}
                      onPress={() => setSelectedFoodIndex(index)}>
                      <Text style={styles.pendingFoodName}>
                        {pending.detectedFood.nameKo ||
                          pending.detectedFood.nameEn ||
                          pending.detectedFood.name}
                      </Text>
                      <Text style={styles.pendingFoodCount}>
                        {pending.foodOptions.length}개의 옵션
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 식사 기록 저장 버튼 */}
              {detectedFoods.length > 0 && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => setShowSaveModal(true)}>
                    <Text style={styles.saveButtonText}>식사 기록 저장</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}>
                <Text style={styles.retakeButtonText}>다시 촬영</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.noResultContainer}>
              <Text style={styles.noResultText}>
                음식을 인식할 수 없습니다.
              </Text>
              <Text style={styles.noResultSubtext}>
                더 명확한 사진을 촬영해주세요.
              </Text>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}>
                <Text style={styles.retakeButtonText}>다시 촬영</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 음식 선택 모달 */}
      {selectedFoodIndex !== null &&
        pendingSelections[selectedFoodIndex] && (
          <FoodSelectionModal
            visible={selectedFoodIndex !== null}
            detectedFoodName={
              pendingSelections[selectedFoodIndex].detectedFood.nameKo ||
              pendingSelections[selectedFoodIndex].detectedFood.nameEn ||
              pendingSelections[selectedFoodIndex].detectedFood.name
            }
            foodOptions={pendingSelections[selectedFoodIndex].foodOptions}
            onSelect={(food) =>
              handleFoodSelect(
                pendingSelections[selectedFoodIndex].detectedFood.name,
                food,
              )
            }
            onCancel={() => setSelectedFoodIndex(null)}
          />
        )}

      {/* 식사 기록 저장 모달 */}
      <SaveMealModal
        visible={showSaveModal}
        foods={detectedFoods}
        totalGL={totalGL}
        onSave={handleSaveMeal}
        onCancel={() => setShowSaveModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  analysisResult: {
    flex: 1,
  },
  glBadge: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  glValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  glMessage: {
    fontSize: 16,
    color: COLORS.WHITE,
  },
  foodListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  pendingSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  pendingItem: {
    padding: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  pendingFoodCount: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  noResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.SAFE,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  retakeButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  retakeButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
