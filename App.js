import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from './theme';
import { useCallback, useState, useEffect } from 'react';

import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from './api/weather';
import { weatherImages } from './constants';
import * as Progress from 'react-native-progress'
import { getData, storeData } from './utils/asyncStorage';

export default function App() {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState({}) 
  const [loading, setLoading] = useState(false)
 
  const handleLocation = (loc) => {
    console.log('Location chosen: ' + loc)
    setLocations([]);
    toggleSearch(false);
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      console.log('got forecast: ', data)
      setWeather(data)
      setLoading(false)
      storeData('city', loc.name)
    })

  }

  const handleSearch =  value => {
    // console.log('value: ', value)
    if (value.length > 2) {
      fetchLocations({cityName: value}).then( data => {
        console.log('got location: ', data )
        setLocations(data);
      })
    }
  }

  useEffect(() => {
    fetchDefaultWeatherData();
  }, [])

  const fetchDefaultWeatherData = async() => {
    //Get preload data from local storage.
    let myCity = await getData('city');
    let cityName = 'Banting'
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

  const { current, location, forecast } = weather;

  return (
    
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image blurRadius={70} source={require('./assets/images/bg.png')} className="absolute h-full w-full"/>
      {
        loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2"/>
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/* Search Section =========== */}
            <View style={{height: '7%'}} className="mx-4 relative z-50">
              <View className="flex-row justify-end items-center rounded-full" style={{backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent'}}>
                  {
                    showSearch ? (
                      <TextInput 
                        onChangeText={handleTextDebounce}
                        placeholder='Search a city...'
                        placeholderTextColor={'lightgray'}
                        className="pl-6 h-10 flex-1 text-base text-white"
                      />
                    ) : null
                  }
                  
                  <TouchableOpacity 
                    onPress={() => toggleSearch(!showSearch)}
                    style={{backgroundColor: theme.bgWhite(0.3)}}
                    className="rounded-full p-3 m-1"
                  >
                    <MagnifyingGlassIcon size="25" color="white"></MagnifyingGlassIcon>
                  </TouchableOpacity>
              </View>
              {
                locations.length>0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                    {
                      locations.map((loc, idx) => {
                        let showBorder = idx+1 != locations.length
                        let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : ''
                        return (
                            <TouchableOpacity 
                                key={idx} 
                                className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}
                                onPress={() => handleLocation(loc)}
                            >
                              <MapIcon size={20} color='gray'/>
                              <Text className="text-black text-lg ml-2 ">{loc?.name}, {loc?.country}</Text>
                            </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                ) : null
              }
            </View>

            {/* forecast section */}
            <View className="mx-4 flex justify-around flex-1 mb-2">
              {/* Location */}
              <Text className="text-white text-center text-2xl font-bold">{location?.name}, <Text className="text-lg font-semibold text-gray-300">{" " + location?.country}</Text></Text>
              {/* weather image */}
              <View className="flex-row justify-center">
                {/* commented as image is blurry from the given api url espone <Image source={{uri: 'https:'+current?.condition?.icon}} className="w-52 h-52"/>  */}
                <Image source={weatherImages[current?.condition?.text]} className="w-52 h-52"></Image>
              </View>
              {/* degree celcius and weather description */}
              <View className="space-y-2">
                <Text className="text-center font-bold text-white text-6xl ml-5">{current?.temp_c}&#176;</Text>
                <Text className="text-center text-white text-xl ml-5">{current?.condition?.text}</Text>
              </View>
              {/* other stats */}
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2">
                  <Image source={require('./assets/icons/wind.png')} className="h-6 w-6"></Image>
                  <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                </View>
                <View className="flex-row space-x-2">
                  <Image source={require('./assets/icons/drop.png')} className="h-6 w-6"></Image>
                  <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                </View>
                <View className="flex-row space-x-2">
                  <Image source={require('./assets/icons/sun.png')} className="h-6 w-6"></Image>
                  <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                </View>
              </View>
            </View>

            {/* forecast next days */}
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size={22} color='white'></CalendarDaysIcon>
                <Text className="text-white text-base">Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}
              >
                  {
                    weather?.forecast?.forecastday?.map((item, idx) => {
                      let date = new Date(item.date)
                      let options = { weekday: 'long'}
                      let dayName = date.toLocaleDateString('en-us', options)
                      dayName = dayName.split(',')[0]
                      return (
                          <View key={idx} 
                            className="flex justify-center items-center w-24 rounded-3xl py-2 space-y-1 mr-4"
                            style={{backgroundColor: theme.bgWhite(0.15)}}
                          >
                            <Image source={weatherImages[item?.day?.condition?.text]} className="h-11 w-11"></Image>
                            <Text className="text-white">{dayName}</Text>
                            <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                          </View>

                      )
                    })
                  }
                  {/* Dummy another 3 as no api forecast data */}
                  <View 
                    className="flex justify-center items-center w-24 rounded-3xl py-2 space-y-1 mr-4"
                    style={{backgroundColor: theme.bgWhite(0.15)}}
                  >
                    <Image source={weatherImages['Sunny']} className="h-11 w-11"></Image>
                    <Text className="text-white">Dummy</Text>
                    <Text className="text-white text-xl font-semibold">32&#176;</Text>
                  </View>
                  <View 
                    className="flex justify-center items-center w-24 rounded-3xl py-2 space-y-1 mr-4"
                    style={{backgroundColor: theme.bgWhite(0.15)}}
                  >
                    <Image source={weatherImages['Sunny']} className="h-11 w-11"></Image>
                    <Text className="text-white">Dummy</Text>
                    <Text className="text-white text-xl font-semibold">32&#176;</Text>
                  </View>
                  <View 
                    className="flex justify-center items-center w-24 rounded-3xl py-2 space-y-1 mr-4"
                    style={{backgroundColor: theme.bgWhite(0.15)}}
                  >
                    <Image source={weatherImages['Sunny']} className="h-11 w-11"></Image>
                    <Text className="text-white">Dummy</Text>
                    <Text className="text-white text-xl font-semibold">32&#176;</Text>
                  </View>
                  {/* Dummy another 3 as no api forecast data */}
                  

              </ScrollView>
            </View>
            
          </SafeAreaView>
        )
      }
      
    </View>

  );
}

