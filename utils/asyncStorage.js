import asyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    await asyncStorage.setItem(key, value);
  } catch (error) {
    console.log('Error storing value: ', error);
  }
};


export const getData = async (key) => {
    try {
      const value = await asyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.log('Error retrieving value: ', error);
    }
};