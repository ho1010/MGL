import {useState} from 'react';
import {launchCamera, launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';

interface UseImagePickerReturn {
  imageUri: string | null;
  pickImage: () => void;
  takePhoto: () => void;
  clearImage: () => void;
}

const useImagePicker = (): UseImagePickerReturn => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    takePhoto,
    pickImage,
    clearImage,
  };
};

export default useImagePicker;

