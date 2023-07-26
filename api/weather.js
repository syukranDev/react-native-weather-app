import axios from "axios";
import { apiKey } from "../constants";

const forecastEndpoint = `https://weatherapi-com.p.rapidapi.com/forecast.json`;
const locationEndpoint = `https://weatherapi-com.p.rapidapi.com/search.json`;

const apiCall = async(endpoint, params, type) => {
    if (type === 'optionLocation') {
        let options = {
            method: 'GET',
            url: endpoint,
            params: {
                q: params.cityName || 'London'
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
              }
        }
        try {
            console.log(options.url)
            const resp = await axios.request(options);
            return resp.data;
    
        } catch(err) {
            console.log('Error: ' + err.message);
            return null;
        }
    }
    if (type === 'optionsForecast') {
        let options = {
            method: 'GET',
            url: endpoint,
            params: {
                q: params.cityName || 'London',
                days: params.days || '7'
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
              }
        }
        try {
            console.log(options.url)
            const resp = await axios.request(options);
            return resp.data;
    
        } catch(err) {
            console.log('Error: ' + err.message);
            return null;
        }
    }

}

export const fetchWeatherForecast = params => {
    return apiCall(forecastEndpoint, params, 'optionsForecast')
}

export const fetchLocations = params => {
    return apiCall(locationEndpoint, params, 'optionLocation')
}

