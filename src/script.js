const root = document.documentElement
const openNavBtn = document.getElementById("open-nav-btn")
const closeNavBtn = document.getElementById("close-nav-btn")
const navBar = document.getElementById("nav-bar")

const themeBtn = document.getElementById("theme-btn")
const themeBtnText = document.getElementById("theme-btn-text")
const themeMenu = document.getElementById("theme-menu")
const themeMenuOption = themeMenu.querySelectorAll("input")
const lightMatchMedia = window.matchMedia("(prefers-color-scheme: light)")

let themeName

// real time change listener for OS theme
lightMatchMedia.addEventListener("change",() => {
  updateSystemTheme(lightMatchMedia)
})

function setTheme(name, event, sunrise, sunset) {
  localStorage.setItem("active-theme", name)
  switch (name) {
    case 'day/night':
      const lightOrDark = varifyTimeOfDay(sunrise,sunset) === "day" ? "light" : "dark"
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          root.style.colorScheme = lightOrDark
        })
      }
      else {
        root.style.colorScheme = lightOrDark
      }
      themeBtnText.textContent = "Day/Night"
      
      break;
    
    case 'dark':
      if (document.startViewTransition) {
        document.startViewTransition(() => root.style.colorScheme = "dark")
      }
      else {
        root.style.colorScheme = "dark"
      }
      themeBtnText.textContent = "Dark"
      break;
    
    case 'light':
      if (document.startViewTransition) {
        document.startViewTransition(() => root.style.colorScheme = "light")
      }
      else {
        root.style.colorScheme = "light"
      }
      themeBtnText.textContent = "Light"
      break;
    
    case 'system':
      if (document.startViewTransition) {
        document.startViewTransition(() => updateSystemTheme(event))
      }
      else {
        updateSystemTheme(event)
      }
      themeBtnText.textContent = "System"
      break;
  }
}

function varifyTimeOfDay(sunrise,sunset,cTime) {
  let time
  
  if (!cTime) {
    const userTime = new Date()
    time = userTime.toLocaleString([], { hour12: false }).split(",")[1].split(":")
  }
  else {
    time = cTime.split(":")
  }
  
  const [hour, min, sec] = time
  
  const timeInMinutes = (+hour * 60) + +min
  let sunUp
  let sunDown 
  
  if (sunrise) {
    const [hr, mi] = sunrise.split("T")[1].split(":")
    sunUp = (+hr * 60) + +mi
  }
  else {
    sunUp = 6 * 60
  }
  
  if(sunset) {
    const [hr, mi] = sunset.split("T")[1].split(":")
    sunDown = (+hr * 60) + +mi
  }
  else {
    sunDown = 18 * 60
  }

  if (sunUp <= timeInMinutes && timeInMinutes < sunDown) {
    return "day"
  }
  else {
    return "night"
  }
}

function updateSystemTheme(event) {
  if (event.matches) {
    root.style.colorScheme = "light"
  }
  else {
    root.style.colorScheme = "dark"
  }
}

const unitsBtn = document.getElementById("units-btn")
const unitsMenu = document.getElementById("units-menu")
const forecastBtn = document.getElementById("hourly-forecast-btn")
const forecastMenu = document.getElementById("hourly-forecast-menu")

const addToFavBtn = document.getElementById("addToFav-btn")

const btnGroup = [themeBtn, unitsBtn, forecastBtn]
const menuGroup = [themeMenu, unitsMenu, forecastMenu]

function controlMenu(btn,menu,value) {
  const state = value === "open" ? "true" : "false"
  menu.dataset.visible = state
  btn.setAttribute("aria-expanded", state)
  btn.children[1].dataset.active = state
}

function closeBtns() {
  btnGroup.forEach((btn) => {
    btn.children[1].dataset.active = "false"
    btn.setAttribute("aria-expanded", "false")
  })
  menuGroup.forEach((menu) => {
    menu.dataset.visible = "false"
  })
}

let tempUnit = "celsius"
let windUnit = "kmh"
let precipUnit = "mm"

const unitsType = document.getElementById("units-type")

const unitsOptBtn = document.getElementById("unitsOptBtn")
const temp = document.getElementsByName("temperature")
const wind = document.getElementsByName("wind-speed")
const precip = document.getElementsByName("precipitation")

function debounce(call, delay = 500) {
  let time
  return (...args) => {
    clearTimeout(time)
    time = setTimeout(() => {
      call(...args)
    }, delay)
  }
}

let savedWeatherData

const pageHeadline = document.getElementById("page-headline")
const weatherSummery = document.getElementById("weather-summery")
const searchInput = document.getElementById("search-input")
const searchSuggestList = document.getElementById("search-suggestion")
const searchLocate = document.getElementById("search-locate")
const apiErrorWindow = document.getElementById("api-error-window")

const currentPlaceText = document.getElementById("current-place")
const currentTempText = document.getElementById("current-temp")
const currentTempUnitText = document.getElementById("current-temp-unit")
const currentDateText = document.getElementById("current-date")
const currentWeekText = document.getElementById("current-week")
const currentMonthText = document.getElementById("current-month")
const currentDateYearText = document.getElementById("current-date_year")
const currentWeatherImg = document.getElementById("current-weather-img")

const feelsLikeText = document.getElementById("feels-like")
const feelsLikeUnitText = document.getElementById("feels-like-unit")
const humidityText = document.getElementById("humidity")
const windText = document.getElementById("wind")
const windUnitText = document.getElementById("wind-unit")
const precipText = document.getElementById("precip")
const precipUnitText = document.getElementById("precip-unit")

const uvIndexText = document.getElementById("uv-index")
const visibilityText = document.getElementById("visibility")
const surfPressureText = document.getElementById("surface-pressure")
const dewPointText = document.getElementById("dew-point")
const dewPointTextUnit = document.getElementById("dew-point-unit")

const dailyForcastUl = document.getElementById("daily-forcast-ul")

const hourlyBtnText = document.getElementById("hourly-btn-text")
const hourlyInfoList = document.getElementById("hourly-forecast-info")

const myLocationBtn = document.getElementById("search-locate")
const curDiv = document.getElementById("cur-div")
const curHomeImg = document.getElementById("cur-img")
const divBgClr = document.getElementById("div-bg-clr")

const notify = document.getElementById("notify")
const notifyText = document.getElementById("notify-text")
const notifyCloseBtn = document.getElementById("notify-close-btn")

// users current location

const getCoordinates = (() => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Browser doesn't support Geo-Location"))
    }
    else {
      navigator.geolocation.getCurrentPosition(
        (position) => {resolve(position)},
        (error) => {reject(error)},
        {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
      )
    }
  })
})

let userData = false

async function getUserLocation() {
  try {
    const position = await getCoordinates()
    
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    
    const getLocationData = await fetch(reverseGeoLocationUrl(latitude, longitude))
    const data = await getLocationData.json()
    
    const countryCode = data.countryCode.toLowerCase()
    const country = data.countryName
    const name = data.locality
    
    const value = `${name},${country},${countryCode},${longitude},${latitude}`
    
    userData = true
    fetchForcast(value,tempUnit,windUnit,precipUnit)
  }
  catch(error) {
    const value = "Berlin,Germany,de,13.41053,52.52437"
    switch (error.code) {
      case error.PERMISSION_DENIED:
        notify.dataset.visible = "true"
        notifyText.textContent = "you denied location request"
        notify.dataset.animation1 = "slide-down"
        
        console.log("user denied the request")
        
        fetchForcast(value,tempUnit,windUnit,precipUnit)
        break;
      
      case error.POSITION_UNAVAILABLE:
        notify.dataset.visible = "true"
        notifyText.textContent = "location info is not available"
        notify.dataset.animation1 = "slide-down"
        console.log("location info is not available")
        fetchForcast(value,tempUnit,windUnit,precipUnit)
        break;
        
      case error.TIMEOUT:
        notify.dataset.visible = "true"
        notifyText.textContent = "location request timed out"
        notify.dataset.animation1 = "slide-down"
        console.log("the request to get location is timed out")
        break;
    }
  }
}

const userLocationDebounce = debounce(() => {
  getUserLocation()
})

const searchDebounce = debounce((str) => {
  fetchPlace(str)
})

function flagUrl(countryCode) {
  if (!countryCode) {
    return "./assets/images/3d-globe-world-blue-white-23748_64.png"
  }
  return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`
}

function reverseGeoLocationUrl(latitude, longitude) {
  return `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
}

function geoUrl(placeName) {
  return `https://geocoding-api.open-meteo.com/v1/search?name=${placeName}&count=10&language=en&format=json`
}

function forcastUrl(latitude,longitude,tempUnit,windUnit,precipUnit) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,uv_index_max&hourly=temperature_2m,weather_code,visibility,dew_point_2m&models=best_match&current=is_day,temperature_2m,weather_code,precipitation,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=auto&wind_speed_unit=${windUnit}&temperature_unit=${tempUnit}&precipitation_unit=${precipUnit}`
}

function createSearchList(name,country,code,longitude,latitude) {
  const li = document.createElement("li")
  const btn = document.createElement("button")
  const span = document.createElement("span")
  const img = document.createElement("img")
  
  btn.type = "button"
  btn.classList = "[ c-flex-row c-align-items-center c-col-gap-3 ][ u-width-1 u-pd-block-3 u-text-align-left u-bg-transparent u-focus-outline u-cursor-pointer ]"
  btn.value = `${name},${country},${code},${longitude},${latitude}`
  
  img.src = flagUrl(code)
  img.classList = "[ b-flag-img ]"
  img.alt = `${country} flag`
  
  span.role = "presentation"
  span.textContent = `${name}, ${country}`
  
  btn.append(img, span)
  li.append(btn)
  
  return li
}

const noResult = document.getElementById("no-result")
const apiRetryBtn = document.getElementById("api-retry-btn")

function varifyError(error) {
  if(!error) {
    searchInput.setAttribute("aria-invalid","false")
    noResult.dataset.visible = "false"
    weatherSummery.dataset.visible = "true"
  }
  else if (error.message.includes("undefined")) {
    //undefined is not an object (evaluating 'placeJson.results.length')
    searchSuggestList.textContent = ""
    searchSuggestList.dataset.visible = "false"
    searchInput.setAttribute("aria-invalid","true")
    noResult.dataset.visible = "true"
    weatherSummery.dataset.visible = "true"
  }
  else {
    apiErrorWindow.dataset.visible = "true"
    pageHeadline.dataset.visible = "false"
    weatherSummery.dataset.visible = "false"
    searchInput.setAttribute("aria-invalid","false")
    noResult.dataset.visible = "false"
  }
}

function recentList() {
  let searchFragments = document.createDocumentFragment()

  for (let i = Object.keys(savedWeatherData.recent).length - 1; i >= 0 ; i--) {
    const key = Object.keys(savedWeatherData.recent)[i]
    const value = savedWeatherData.recent[key]
    
    const keyData = key.split(",")
    const valueData = value.split(",")
    
    const name = keyData[0]
    const country = keyData[1].trimStart()
    
    const countryCode = valueData[0]
    const longitude = valueData[1]
    const latitude = valueData[2]
    
    const list = createSearchList(name, country, countryCode, longitude, latitude)
    
    searchFragments.append(list)
  }

  searchSuggestList.dataset.visible = "true"
  searchSuggestList.append(searchFragments)
  searchSuggestList.setAttribute("aria-label", "recent searches")
}

async function fetchPlace(name) {
  try {
    varifyError()
    const getPlace = await fetch(geoUrl(name))
    const placeJson = await getPlace.json()
    
    searchSuggestList.textContent = ""
    
    if (!searchInput.value) {
      if(Object.keys(savedWeatherData.recent).length) {
        recentList()
      }  
    }
    else {
      const resultsLength = placeJson.results.length
      let searchFragments = document.createDocumentFragment()
      
      for (let i = 0; i < resultsLength; i++) {
        const name = placeJson.results[i].name
        let country = placeJson.results[i].country
        let countryCode
        
        if (country) {
          countryCode = (placeJson.results[i].country_code).toLowerCase()
        }
        else { // for places with no country or countryCode
          countryCode = ""
          country = "Earth"
        }
        
        const longitude = placeJson.results[i].longitude
        const latitude = placeJson.results[i].latitude
        
        const list = createSearchList(name, country, countryCode, longitude, latitude)
        searchFragments.append(list)
      }
      
      searchSuggestList.dataset.visible = "true"
      searchSuggestList.append(searchFragments)
      searchSuggestList.setAttribute("aria-label", "search results")
    }
  }
  catch(error) {
    console.log(error)
    varifyError(error)
  }
}

function dateToWeekMonth_Name(forcastDate) {
  const date = new Date(forcastDate + "T00:00:00")
  const weekName = date.toLocaleString('en-us', {weekday: "long"})
  const monthName = date.toLocaleString('en-us', {month: "long"})
  
  return [weekName, monthName]
}

function createWeatherSvg(imgAlt,dValue) {
  const xlmns = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(xlmns, "svg")
  const path = document.createElementNS(xlmns, "path")
  
  svg.setAttribute("role", "image")
  svg.setAttribute("aria-label", imgAlt)
  svg.setAttribute("width", "32")
  svg.setAttribute("height", "32")
  svg.setAttribute("viewBox", "0 0 24 24")
  
  path.setAttribute("fill", "currentColor")
  path.setAttribute("d", dValue)
  
  svg.append(path)
  return svg
}

function weatherCodeToImg(weatherCode,dayOrNight) {
  switch (true) {
    case weatherCode <= 1 :
      if (dayOrNight != "night") {
        return createWeatherSvg("sunny clear sky", "M12 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 2m5 10a5 5 0 1 1-10 0a5 5 0 0 1 10 0m4.25.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5zM12 19a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 19m-7.75-6.25a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5zm-.03-8.53a.75.75 0 0 1 1.06 0l1.5 1.5a.75.75 0 0 1-1.06 1.06l-1.5-1.5a.75.75 0 0 1 0-1.06m1.06 15.56a.75.75 0 1 1-1.06-1.06l1.5-1.5a.75.75 0 1 1 1.06 1.06zm14.5-15.56a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 0 0 1.06 1.06l1.5-1.5a.75.75 0 0 0 0-1.06m-1.06 15.56a.75.75 0 1 0 1.06-1.06l-1.5-1.5a.75.75 0 1 0-1.06 1.06z")
      }
      else {
        return createWeatherSvg("clear night sky", "M20.026 17.001c-2.762 4.784-8.879 6.423-13.663 3.661A10 10 0 0 1 3.13 17.68a.75.75 0 0 1 .365-1.132c3.767-1.348 5.785-2.91 6.956-5.146c1.233-2.353 1.551-4.93.689-8.463a.75.75 0 0 1 .769-.927a9.96 9.96 0 0 1 4.457 1.327c4.784 2.762 6.423 8.879 3.66 13.662")
      }
      //return "./assets/images/icon-sunny.webp,clear Sky"
    
    case weatherCode === 2:
      if (dayOrNight != "night") {
        return createWeatherSvg("partly cloudy day", "M13.002 8.007c3.169 0 4.966 2.097 5.227 4.63h.08a3.687 3.687 0 0 1 3.692 3.683a3.687 3.687 0 0 1-3.692 3.682H7.695a3.687 3.687 0 0 1-3.692-3.682a3.687 3.687 0 0 1 3.692-3.683h.08c.263-2.55 2.059-4.63 5.227-4.63m-8.634 4.155a.75.75 0 0 1-.315.935l-.091.045l-.927.384a.75.75 0 0 1-.665-1.34l.091-.046l.927-.383a.75.75 0 0 1 .98.405m6.487-4.833l-.172.058c-1.784.63-3.062 2.005-3.615 3.823l-.07.25l-.058.238l-.206.039a4.6 4.6 0 0 0-1.67.714a3.942 3.942 0 0 1 5.791-5.122M2.94 7.36l.105.035l.927.384a.75.75 0 0 1-.469 1.42L3.4 9.166l-.927-.384a.75.75 0 0 1 .469-1.42m3.815-2.986l.045.091l.384.927a.75.75 0 0 1-1.34.665L5.8 5.968l-.383-.927a.75.75 0 0 1 1.34-.665m4.354-.319a.75.75 0 0 1 .44.875l-.035.105l-.383.927a.75.75 0 0 1-1.421-.469l.035-.106l.384-.926a.75.75 0 0 1 .98-.406")
      }
      else {
        return createWeatherSvg("partly cloudy night sky", "M13.002 8.013c3.168 0 4.966 2.097 5.227 4.63h.08a3.687 3.687 0 0 1 3.692 3.683a3.687 3.687 0 0 1-3.692 3.682H7.694a3.687 3.687 0 0 1-3.692-3.682a3.687 3.687 0 0 1 3.692-3.683h.08c.263-2.55 2.06-4.63 5.228-4.63M6.589 4.005a5.06 5.06 0 0 1 2.263.674a5.06 5.06 0 0 1 2.208 2.595c-1.984.562-3.404 2.001-3.994 3.946l-.069.246l-.058.238l-.206.038a4.67 4.67 0 0 0-2.804 1.815a5.06 5.06 0 0 1-1.797-1.599a.75.75 0 0 1 .366-1.132c1.643-.588 2.527-1.25 3.034-2.216c.552-1.055.654-2.174.287-3.677a.75.75 0 0 1 .77-.928")
      }
      //return "./assets/images/icon-partly-cloudy.webp,cloudy"
    
    case weatherCode === 3:
      return createWeatherSvg("overcast", "M13.002 7.009c3.168 0 4.966 2.097 5.227 4.63h.08a3.687 3.687 0 0 1 3.692 3.683a3.687 3.687 0 0 1-3.692 3.682H7.694a3.687 3.687 0 0 1-3.692-3.682a3.687 3.687 0 0 1 3.692-3.683h.08c.263-2.55 2.06-4.63 5.228-4.63M10 4c1.617 0 3.05.815 3.9 2.062a8 8 0 0 0-.898-.053c-2.994 0-5.171 1.677-5.937 4.213l-.068.24l-.058.238l-.206.039a4.68 4.68 0 0 0-3.449 3.045a3.282 3.282 0 0 1 1.812-5.881l.257-.006A4.72 4.72 0 0 1 10 4")
      //return "./assets/images/icon-overcast.webp,overcast"
    
    case weatherCode === 45 || weatherCode === 48:
      return createWeatherSvg("fog", "M7.745 19.5h8.501a.75.75 0 0 1 .102 1.493l-.102.007H7.745a.75.75 0 0 1-.102-1.493zh8.501zM4.75 16.52h14.5a.75.75 0 0 1 .102 1.492l-.102.007H4.75a.75.75 0 0 1-.102-1.493zM12 3.004c3.169 0 4.966 2.097 5.227 4.63h.08A3.687 3.687 0 0 1 21 11.318A3.687 3.687 0 0 1 17.307 15H6.693A3.687 3.687 0 0 1 3 11.318a3.687 3.687 0 0 1 3.693-3.683h.08c.262-2.55 2.058-4.63 5.227-4.63")
      //return "./assets/images/icon-fog.webp,fog"
    
    case weatherCode >= 51 && weatherCode <= 57:
      return createWeatherSvg("drizzle", "M12 3.001c3.169 0 4.966 2.097 5.227 4.63h.08A3.687 3.687 0 0 1 21 11.314a3.687 3.687 0 0 1-3.692 3.682h-.582l-.003.004h-.264a.8.8 0 0 1-.083.167l-1 1.5a.75.75 0 0 1-1.248-.832l.559-.839h-1.83l-.002.004h-.397a.8.8 0 0 1-.083.166l-1 1.5a.75.75 0 1 1-1.248-.831l.56-.839H8.986L8.985 15h-.527a.8.8 0 0 1-.084.167l-1 1.5a.75.75 0 0 1-1.248-.832l.56-.839A3.687 3.687 0 0 1 3 11.314A3.687 3.687 0 0 1 6.693 7.63h.08C7.035 5.08 8.831 3 12 3M7.126 18.834a.75.75 0 1 0 1.248.832l1-1.5a.75.75 0 1 0-1.248-.832zm4.208 1.04a.75.75 0 0 1-.208-1.04l1-1.5a.75.75 0 1 1 1.248.832l-1 1.5a.75.75 0 0 1-1.04.208")
      //return "./assets/images/icon-drizzle.webp,drizzle"
    
    case weatherCode >= 61 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82:
      return createWeatherSvg("rainy", "M12 4.001c3.169 0 4.966 2.097 5.227 4.63h.08A3.687 3.687 0 0 1 21 12.314a3.687 3.687 0 0 1-3.692 3.682h-.582l-1.583 2.637a.75.75 0 0 1-1.344-.659l.045-.091l1.15-1.887h-2.136l-1.583 2.637a.75.75 0 0 1-1.344-.659l.045-.091l1.15-1.887H8.987l-1.581 2.637a.75.75 0 0 1-1.344-.659l.045-.091l1.148-1.887h-.562A3.687 3.687 0 0 1 3 12.314A3.687 3.687 0 0 1 6.693 8.63h.08C7.035 6.08 8.831 4 12 4")
      //return "./assets/images/icon-rain.webp,rain"
    
    case weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 88:
      return createWeatherSvg("snow", "M9.75 18.152a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m4.5 0a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m-6.75-1a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m4.5 0a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m4.5 0a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5M12 4c3.169 0 4.966 2.097 5.227 4.63h.08A3.687 3.687 0 0 1 21 12.314a3.687 3.687 0 0 1-3.692 3.682H6.693A3.687 3.687 0 0 1 3 12.314A3.687 3.687 0 0 1 6.693 8.63h.08C7.035 6.08 8.831 4 12 4")
      //return "./assets/images/icon-snow.webp,snow"
    
    case weatherCode >= 95 && weatherCode <= 99:
      return createWeatherSvg("stormy", "M13.76 13.204a.75.75 0 0 1 .056 1.059l-1.111 1.236h2.276a.75.75 0 0 1 .587 1.218l-3.212 4.031a.75.75 0 0 1-1.173-.934l2.242-2.815h-2.403a.75.75 0 0 1-.558-1.251L12.7 13.26a.75.75 0 0 1 1.06-.056m-.758-8.195c3.168 0 4.966 2.097 5.227 4.63h.08a3.687 3.687 0 0 1 3.692 3.683a3.687 3.687 0 0 1-3.692 3.682h-1.747c.543-1.113-.252-2.505-1.58-2.505h-.136a1.75 1.75 0 0 0-2.89-1.907l-2.235 2.487a1.73 1.73 0 0 0-.277 1.926h-1.75a3.687 3.687 0 0 1-3.692-3.683a3.687 3.687 0 0 1 3.692-3.683h.08c.263-2.55 2.06-4.63 5.228-4.63M10 2c1.617 0 3.05.815 3.9 2.062a8 8 0 0 0-.898-.053c-2.994 0-5.171 1.677-5.937 4.213l-.068.24l-.058.238l-.206.039a4.68 4.68 0 0 0-3.449 3.045a3.282 3.282 0 0 1 1.812-5.881l.257-.006A4.72 4.72 0 0 1 10 2")
      //return "./assets/images/icon-storm.webp,storm"
  }
}

function createDailyLi(date,day,weatherImg,tempUnt,maxTemp,minTemp) {
  //const li = document.createElement("li")
  const liFragment = document.createDocumentFragment()
  const h4 = document.createElement("h4")
  const time = document.createElement("time")
  const abbr = document.createElement("abbr")
  const img = document.createElement("img")
  const div = document.createElement("div")
  const p1 = document.createElement("p")
  const spanMax = document.createElement("span")
  const spanMaxTemp = document.createElement("span")
  const p2 = document.createElement("p")
  const spanMin = document.createElement("span")
  const spanMinTemp = document.createElement("span")
  
  
  //li.classList = "[ c-flex-col c-justify-con-sb c-align-items-center ][ u-height-3 u-pd-inline-4 u-pd-block-1 u-bg-clr-1 u-border-radius-1 ]"
  
  time.setAttribute("datetime",date)
  
  abbr.classList = "[ u-text-deco-none ]"
  abbr.title = day
  abbr.textContent = day.slice(0,3)
  
  time.append(abbr)
  h4.append(time)
  
  weatherImg.classList = "[ u-width-4 u-height-fit ]"
  /*img.classList = "[ u-width-4 ]" // replace with svg
  img.src = weatherImg
  img.alt = imgAlt*/
  
  div.role = "presentation"
  div.classList = "[ c-flex-row c-justify-con-sb ][ u-width-1 ]" 
  
  p1.classList = "[ c-pos-relative ]"
  
  spanMax.classList = "[ c-pos-absolute ][ b-hidden ]"
  spanMax.textContent = `maximum temperature in ${tempUnt}`
  spanMaxTemp.classList = "[ u-fs-1 u-fw-2 ]"
  spanMaxTemp.textContent = maxTemp + "\u00B0"
  
  p1.append(spanMax, spanMaxTemp)
  
  p2.classList = "[ c-pos-relative ]"
  
  spanMin.classList = "[ c-pos-absolute ][ b-hidden ]"
  spanMin.textContent = `mininmum temperature in ${tempUnt}`
  spanMinTemp.classList = "[ u-fs-1 u-fw-2 u-clr-6 ]"
  spanMinTemp.textContent = minTemp + "\u00B0"
  
  p2.append(spanMin, spanMinTemp) 
  
  div.append(p1, p2)
  
  //liFragment.append(h4, img, div) // img with svg
  liFragment.append(h4, weatherImg, div)
  
  return liFragment
  
}

function createDailyForcastList(dates,weatherCodes,tempUnt,maxTemps,minTemps) {
  
  for (let i = 0; i < dates.length; i++)  {
    const date = dates[i]
    const day = dateToWeekMonth_Name(dates[i])[0]
    const weatherImg = weatherCodeToImg(weatherCodes[i])
    const maxTemp = Math.round(maxTemps[i])
    const minTemp = Math.round(minTemps[i])
    
    const li = createDailyLi(date,day,weatherImg,tempUnt,maxTemp,minTemp)
    dailyForcastUl.children[i].append(li)
  }
}

function createHourlyMenuOptions(dateAndTime) {
  const hourlyOptionFragments = document.createDocumentFragment()

  for (let i = 0; i < 7; i++) {
    const no = i * 24
    const date = dateAndTime[no].split("T")[0]
    const day = dateToWeekMonth_Name(date)[0]
    
    const label = document.createElement("label")
    const time = document.createElement("time")
    const input = document.createElement("input")
    
    
    label.classList = "[ c-pos-relative ][ u-focus-outline u-cursor-pointer ]"
    
    time.classList = "[ u-pd-inline-2 ]"
    time.setAttribute("datetime", date)
    time.textContent = day
    
    input.classList = "[ c-pos-absolute ][ b-hidden ]"
    input.type = "radio"
    input.name = "hourly-option"
    input.value = no
    
    if(i === 0) {
      input.checked = "true"
    }
    
    label.append(time, input)
    hourlyOptionFragments.append(label)
  }
  
  return hourlyOptionFragments
}

function createHourlyInfoLi(dateTime,hour,weatherImg,temp,tempunit) {
  const li = document.createElement("li")
  const div1 = document.createElement("div")
  const img = document.createElement("img")
  const time = document.createElement("time")
  const div2 = document.createElement("div")
  const p1 = document.createElement("p")
  const p2 = document.createElement("p")
  const span = document.createElement("span")
  const abbr = document.createElement("abbr")
  
  li.classList = "[ c-flex-row c-flex-shrink-0 c-justify-con-sb c-align-items-center  ][ u-height-2 u-pd-inline-st-1 u-pd-inline-end-1 u-bg-clr-4 u-border-radius-1 ]"
  
  div1.role = "presentation"
  div1.classList = "[ c-flex-row c-align-items-center c-col-gap-3 ]"
  
  time.classList = "[ u-fs-6 u-fw-2 ]"
  time.setAttribute("datetime", dateTime)
  time.textContent = hour
  
  div1.append(weatherImg, time)
  
  div2.role = "presentation"
  div2.classList = "[ c-pos-relative ]"
  
  p1.classList = "[ c-pos-absolute ][ b-hidden ]"
  p1.textContent = "temperature"
  
  p2.classList = "[ u-fs-1 u-fw-2 ]"
  
  span.textContent = temp + "\u00B0"
  
  abbr.classList = "[ u-text-deco-none ]"
  abbr.title = tempunit
  abbr.textContent = " " + tempunit[0].toUpperCase()
  
  p2.append(span, abbr)
  div2.append(p1, p2)
  
  li.append(div1, div2)
  
  return li
}

function analogClockFormat(timeHour) {
  const hour = timeHour[0] === "0" ? timeHour[1] : timeHour
  if(hour <= 12) {
    if (hour === "0") {
      return "12 AM"
    }
    else {
      return `${hour} AM`
    }
  }
  else {
    return `${hour - 12} PM`
  }
}

function createHourlyInfoList(btnValue,dateTimes,weatherCodes,temps,tempunit,currentTime,sunrise,sunset) {
  const hourlyInfoFragment = document.createDocumentFragment()
  let [start, end] = [Number(btnValue), Number(btnValue) + 24 ]
  
  const no = btnValue/24
  
  if(start === 0) {
    const curHour = Number(currentTime.split(":")[0])
    const hourLimit = 16
    
    start = curHour > hourLimit ? hourLimit : curHour
  }
  
  for (let i = start; i < end; i++) {
    const time = dateTimes[i].split("T")[1]
    const timeHour = time.split(":")[0]
    const dayOrNight = varifyTimeOfDay(sunrise[no], sunset[no], time)
    const hour = analogClockFormat(timeHour)
    const hourAnalog = analogClockFormat(hour)
    const svg = weatherCodeToImg(weatherCodes[i], dayOrNight)
    const temp = Math.round(temps[i])
    
    const li = createHourlyInfoLi(dateTimes[i], hour, svg, temp, tempunit)
    
    hourlyInfoFragment.append(li)
  }
  return hourlyInfoFragment
}

const currentWeatherInfo = document.getElementById("weather-info")

function loadingAnimation(stop) {
  if(!stop) {
    curDiv.dataset.visible = "false"
    curHomeImg.dataset.hidden = "true"
    divBgClr.dataset.bgcolor = "original"
    divBgClr.dataset.animation = "loading"
    
    feelsLikeText.textContent = "-"
    feelsLikeUnitText.textContent = ""
    feelsLikeUnitText.title = ""
    
    windText.textContent = "-"
    windUnitText.title = ""
    windUnitText.textContent = ""
    
    humidityText.textContent = "-"
    
    precipText.textContent = "-"
    precipUnitText.textContent = ""
    precipUnitText.title = ""
        
    for (let i = 0; i < currentWeatherInfo.children.length ; i++) {
      const section = currentWeatherInfo.children[i]
      section.dataset.animation = "loading"
    }
    
    for (let i = 0; i < dailyForcastUl.children.length; i++) {
      const li = dailyForcastUl.children[i]
      li.textContent = ""
      li.dataset.animation = "loading"
    }
    
    const dummyLists = document.createDocumentFragment()
    for (let i = 0; i < 8; i++) {
      const li = document.createElement("li")
      li.classList = "[ c-flex-col c-flex-shrink-0 ][ u-height-2 u-bg-clr-4 u-border-radius-1 ][ b-skeleton ]"
      li.dataset.animation = "loading"
      dummyLists.append(li)
    }
    hourlyInfoList.textContent = ""
    hourlyInfoList.append(dummyLists)
  }
  else {
    curDiv.dataset.visible = "true"
    curHomeImg.dataset.hidden = "false"
    divBgClr.dataset.bgcolor = "transparent"
    divBgClr.dataset.animation = "none"
    
    for (let i = 0; i < currentWeatherInfo.children.length; i++) {
      const section = currentWeatherInfo.children[i]
      section.dataset.animation = "none"
    }
    
    for (let i = 0; i < dailyForcastUl.children.length; i++) {
      const li = dailyForcastUl.children[i]
      li.dataset.animation = "none"
    }
  }
}

let hourlyTime
let hourlyWeatherCode
let hourlyTemp
let curDate
let curTime
let sunrise
let sunset

let userSurise
let userSunset

async function fetchForcast(btnValue, tempUnit, windUnit, precipUnit ) {
  const [name,country,countryCode,longitude,latitude] = btnValue.split(",")
  try {
    varifyError()
    searchInput.value = ""
    searchSuggestList.textContent = ""
    searchSuggestList.dataset.visible = "false"
    loadingAnimation()
    
    const getForcast = await fetch(forcastUrl(latitude, longitude, tempUnit, windUnit, precipUnit))
    const forcastJson = await getForcast.json()
    
    // unit
    const tempUnitShort = forcastJson.current_units.temperature_2m 
    const windSpeedUnit = forcastJson.current_units.wind_speed_10m
    const precipUnitShort = forcastJson.current_units.precipitation 
    const percentUnit = forcastJson.current_units.relative_humidity_2m
    const pressureUnit = forcastJson.current_units.surface_pressure
    
    //current
    const dateTimeArray = forcastJson.current.time.split("T")
    curDate = dateTimeArray[0]
    curTime = dateTimeArray[1]
    const curWeatherCode = forcastJson.current.weather_code
    const curTemp = forcastJson.current.temperature_2m
    const curWind = forcastJson.current.wind_speed_10m
    const curHumid = forcastJson.current.relative_humidity_2m
    const curPrecip = forcastJson.current.precipitation
    const curFeelsLike = forcastJson.current.apparent_temperature
    const curPressure = forcastJson.current.surface_pressure
    const curUV = forcastJson.daily.uv_index_max[0]
    
    //Daily
    const dailyTime = forcastJson.daily.time
    const dailyWeatherCode = forcastJson.daily.weather_code
    const dailyTempMax = forcastJson.daily.temperature_2m_max
    const dailyTempMin = forcastJson.daily.temperature_2m_min
    
    //hourly
    hourlyTime = forcastJson.hourly.time
    hourlyTemp = forcastJson.hourly.temperature_2m
    hourlyWeatherCode = forcastJson.hourly.weather_code
    
    const hourlyVisiblity = forcastJson.hourly.visibility
    const hourlyDewPoint = forcastJson.hourly.dew_point_2m
    
    // sunrise and sunset
    sunrise = forcastJson.daily.sunrise // current day[0]
    sunset = forcastJson.daily.sunset // current day[0]
    
    if (userData) {
      userSurise = sunrise[0]
      userSunset = sunset[0]
      savedWeatherData.userSunrise = sunrise[0]
      savedWeatherData.userSunset = sunset[0]
    }
    
    const curDayDuration = forcastJson.daily.daylight_duration[0] // current day
    
    const [curWeek, curMonth] = dateToWeekMonth_Name(curDate)
    const [cYear, cMonth, cDate] = curDate.split("-")
    const trimDate = cDate[0] === "0" ? cDate[1] : cDate // remove 0 from start 
    
    currentPlaceText.textContent = `${name}, ${country}`
    
    currentDateText.setAttribute("datetime",curDate)
    
    currentWeekText.textContent = curWeek
    
    currentMonthText.title = curMonth
    currentMonthText.textContent = curMonth.slice(0,3)
    
    currentDateYearText.textContent = `${trimDate}, ${cYear}`
    
    currentTempText.textContent = Math.round(curTemp)
    
    currentTempUnitText.title = tempUnit
    currentTempUnitText.textContent = tempUnitShort[1]
    
    const dayOrNight = varifyTimeOfDay(sunrise[0], sunset[0], curTime)

    const curImg = weatherCodeToImg(curWeatherCode, dayOrNight)
    curImg.classList = "[ b-cur-weather-img ]"
    
    currentWeatherImg.textContent = ""
    currentWeatherImg.append(curImg)
    
    // favourites
    addToFavBtn.value = btnValue
    addToFavBtn.dataset.favourite = "false"
    
    for (let [key, value] of Object.entries(savedWeatherData.favourites)) {
      if (key === `${name}, ${country}`) {
        addToFavBtn.dataset.favourite = "true"
      }
    }
    // add place to recent
    if(!Object.keys(savedWeatherData.recent).length) {
      savedWeatherData.recent[`${name}, ${country}`] = `${countryCode},${longitude},${latitude}`
    }
    else {
      for (let [key, value] of Object.entries(savedWeatherData.recent)) {
        if (key != `${name}, ${country}`) {
          savedWeatherData.recent[`${name}, ${country}`] = `${countryCode},${longitude},${latitude}`
        }
      }
    }
    
    // delete the oldest recent items if recent items are more than 10
    if (Object.keys(savedWeatherData.recent).length > 4) {
      delete Object.keys(savedWeatherData.recent)[0]
    }
    
    // save to localStorage
    localStorage.setItem("weatherData", JSON.stringify(savedWeatherData))
    
    feelsLikeText.textContent = Math.round(curFeelsLike) + "\u00B0"
    feelsLikeUnitText.title = tempUnit
    feelsLikeUnitText.textContent = tempUnitShort[1]
    
    humidityText.textContent = curHumid + percentUnit
    
    windText.textContent = Math.round(curWind)
    windUnitText.title = windSpeedUnit === "km/h" ? "kilometers per hour" : "miles per hour"
    windUnitText.textContent = windSpeedUnit
    
    precipText.textContent = curPrecip
    precipUnitText.title = precipUnitShort === "inch" ? "inches" : "millimeters"
    precipUnitText.textContent = precipUnitShort.slice(0,2)
    
    uvIndexText.textContent = curUV
    
    //dewPointText.textContent = 
    //dewPointTextUnit.title = tempUnit
    dewPointTextUnit.textContent = tempUnitShort
    
    //visibilityText.textContent = 
    surfPressureText.textContent = curPressure
    
    //Daily Forcast
    createDailyForcastList(dailyTime, dailyWeatherCode, tempUnit, dailyTempMax, dailyTempMin)
    
    forecastMenu.textContent = ""
    forecastMenu.append(createHourlyMenuOptions(hourlyTime))
    hourlyBtnText.textContent = forecastMenu.children[0].children[0].textContent
    
    const hourlyListInfo = createHourlyInfoList(0, hourlyTime, hourlyWeatherCode, hourlyTemp, tempUnit, curTime, sunrise, sunset)
    
    hourlyInfoList.textContent = ""
    hourlyInfoList.append(hourlyListInfo)
    
    loadingAnimation(stop)
    userData = false
  }
  catch(error) {
    console.log(error)
    apiErrorWindow.dataset.visible = "true"
    pageHeadline.dataset.visible = "false"
    weatherSummery.dataset.visible = "false"
    searchInput.setAttribute("aria-invalid", "false")
    noResult.dataset.visible = "false"
  }
}

// favourite

const favBtn = document.getElementById("favourite-btn") 
const favMenu = document.getElementById("favourite-menu")
const favSearchbar = document.getElementById("fav-searchbar")
const favList = document.getElementById("fav-list")
const favListError = document.getElementById("fav-list-error")

function createFavList(keys) {
  const listItems = document.createDocumentFragment()
  
  for (let [key, value] of Object.entries(keys)) {
    const keyValue = key.split(",")
    const country = keyValue[1].trimStart()
    const countryCode = value.split(",")[0]
    const mergedValue = `${keyValue[0]},${country},${value}`
    listItems.append(createFavLi(key, country, countryCode, mergedValue))
  }
  return listItems
}

function createFavLi(key, country, countryCode, mergedValue) {
  const li = document.createElement("li")
  const btn1 = document.createElement("button")
  const img = document.createElement("img")
  const div = document.createElement("div")
  const btn2 = document.createElement("button")
  
  const xlmns = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(xlmns, "svg")
  const g = document.createElementNS(xlmns, "g")
  const path1 = document.createElementNS(xlmns, "path")
  const path2 = document.createElementNS(xlmns, "path")
  
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("focusable", "false")
  svg.setAttribute("width", "18")
  svg.setAttribute("height", "19")
  svg.setAttribute("viewBox", "0 0 20 21")
  
  g.classList = "[ u-clr-2 ]"
  g.setAttribute("fill", "#D0D6F9")
  g.setAttribute("fill-rule", "evenodd")
  
  path1.setAttribute("d", "M2.575.954l16.97 16.97-2.12 2.122L.455 3.076z")
  path2.setAttribute("d", "M.454 17.925L17.424.955l2.122 2.12-16.97 16.97z")
  
  g.append(path1, path2)
  svg.append(g)
  
  li.classList = "[ c-flex-row ][ u-focus-outline u-cursor-pointer ]"
  
  btn1.type = "button"
  btn1.classList = "[ c-flex-row c-align-items-center c-col-gap-3 ][ u-width-1 u-pd-inline-1 u-pd-block-1 u-bg-transparent u-text-align-left u-focus-outline u-cursor-pointer ]"
  btn1.dataset.category = "search"
  
  img.src = flagUrl(countryCode)
  img.classList = "[ b-flag-img ]"
  img.alt = `${country} flag`
  
  div.role = "presentation"
  
  if (Array.isArray(key)) {
    const span1 = document.createElement("span")
    const span2 = document.createElement("span")
    const span3 = document.createElement("span")
    
    span1.role = "presentation"
    span1.textContent = key[0]
    
    span2.role = "presentation"
    span2.classList = "[ u-bg-clr-search ]"
    span2.textContent = key[1]
    
    span3.role = "presentation"
    span3.textContent = key[2]
    
    btn1.setAttribute("aria-label",`${key[0] + key[1] + key[2]} click to view weather info`)
    btn1.value = mergedValue
    div.append(span1, span2, span3)
    
    btn2.setAttribute("aria-label", `remove ${key[0] + key[1] + key[2]} from favourite places`)
    btn2.value = key[0] + key[1] + key[2]
  }
  else {
    const span = document.createElement("span")
    btn1.setAttribute("aria-label",`${key}, click to view weather info`)
    btn1.value = mergedValue
    span.textContent = key
    div.append(span)
    
    btn2.setAttribute("aria-label", `remove ${key} from favourite places`)
    btn2.value = key
  }
  
  btn1.append(img, div)
  
  btn2.type = "button"
  btn2.classList = "[ u-pd-inline-1 u-pd-block-1 u-bg-transparent u-text-align-left u-focus-outline u-cursor-pointer ]"
  btn2.dataset.category = "remove"
  btn2.append(svg)
  
  li.append(btn1, btn2)
  
  return li
}

function favSearch(keys, textInput) {
  let searchFragment = document.createDocumentFragment()
  let text = textInput.toLowerCase()
  
  for (let [key, value] of Object.entries(keys)) {
    const keyLower = key.toLowerCase()
    if (keyLower.includes(text)) {
      const textStart = keyLower.indexOf(text)
      const textEnd = textStart + text.length
      
      const word1 = key.slice(0, textStart)
      const matchedWord = key.slice(textStart, textEnd)
      const word2 = key.slice(textEnd)
      
      const keyValue = key.split(",")
      const country = key[1].trimStart()
      const countryCode = value.split(",")[0]
      const mergedValue = `${keyValue[0]},${country},${value}`
      
      const li = createFavLi([word1, matchedWord, word2], country, countryCode, mergedValue)
      
      searchFragment.append(li)
    }
  }
  
  return searchFragment
}

function loadFavPlaces() {
  if (Object.keys(savedWeatherData.favourites).length) {
    favSearchbar.setAttribute("aria-invalide","false")
    
    favListError.dataset.visible = "false"
    
    favList.dataset.visible = "true"
    favList.append(createFavList(savedWeatherData.favourites))
  }
  else {
    favList.dataset.visible = "false"
    
    favListError.textContent = "Empty"
    favListError.dataset.visible = "true"
    
    favSearchbar.setAttribute("aria-invalide","true")
  }
}

const closeFavBtn = document.getElementById("close-fav")

const updateFavDebounce = debounce((inputValue) => {
  const key = savedWeatherData.favourites
  let searchList = favSearch(key, inputValue) 
  favList.textContent = ""
  
  if (!inputValue.length) {
    loadFavPlaces()
  }
  else if (inputValue.length && searchList.children.length) {
    favSearchbar.setAttribute("aria-invalide","false")
    favListError.dataset.visible = "false"
    favList.dataset.visible = "true"
    favList.append(searchList)
  }
  else {
    favList.dataset.visible = "false"
    favListError.textContent = "no search result found"
    favListError.dataset.visible = "true"
    favSearchbar.setAttribute("aria-invalide","true")
  }
})

function mobileMenu(value) {
  switch (value) {
    case 'close': 
      openNavBtn.setAttribute("aria-expanded", "false")
      navBar.dataset.animation = "slide-right-reverse"
      
      break;
      
    default:
      if (openNavBtn.getAttribute("aria-expanded") === "false") {
        navBar.dataset.visible = "true"
        openNavBtn.setAttribute("aria-expanded", "true")
        navBar.dataset.animation = "slide-right"
      }
      break;
  }
}

function btnSearchOrRemove(btn) {
  const btnCategory = btn.dataset.category
  const btnValue = btn.value
  
  switch (btnCategory) {
    case 'search':
      controlMenu(favBtn, favMenu)
      fetchForcast(btnValue, tempUnit, windUnit, precipUnit)
      break;
      
    case 'remove':
      const parentLi = btn.closest("li")
      
      if (currentPlaceText.textContent === btnValue) {
        addToFavBtn.dataset.favourite = "false"
        addToFavBtn.setAttribute("aria-label", `add ${btnValue} to favourite list`)
      }
      
      delete savedWeatherData.favourites[btnValue]
      localStorage.setItem("weatherData", JSON.stringify(savedWeatherData))
      parentLi.remove()
      break;
  }
}

// change unit type and fetchData
function toggleUnitType() {
  if (unitsType.textContent === "Metrics") {
    unitsType.textContent = "Imperial"
    temp[0].checked = true
    wind[0].checked = true
    precip[0].checked = true
    
    tempUnit = temp[0].value
    windUnit = wind[0].value
    precipUnit = precip[0].value
  }
  else {
    unitsType.textContent = "Metrics"
    temp[1].checked = true
    wind[1].checked = true
    precip[1].checked = true
    
    tempUnit = temp[1].value
    windUnit = wind[1].value
    precipUnit = precip[1].value
  }
  
  fetchForcast(addToFavBtn.value, tempUnit, windUnit, precipUnit)
}

(() => {
  // if no weatherData create else assign it's values to savedWeatherData
  if (!localStorage.getItem("weatherData")) {
    savedWeatherData = { "favourites": {}, "recent": {}, "userSunrise": "", "userSunset": "" } //Object
    localStorage.setItem("weatherData", JSON.stringify(savedWeatherData))
  }
  else {
    savedWeatherData = JSON.parse(localStorage.getItem("weatherData"))
  }
  
  userSunrise = savedWeatherData.userSunrise
  userSunset = savedWeatherData.userSunset
  
  // look for active-theme if true assign value to themeName else use default
  if (localStorage.getItem("active-theme")) {
    themeName = localStorage.getItem("active-theme")
    themeMenuOption.forEach((option) => {
      if (themeName === option.value) {
        option.checked = true
      }
    })
  }
  else {
    themeName = "day/night"
  }
  
  setTheme(themeName, lightMatchMedia, userSurise, userSunset)
  
  getUserLocation()
})(); //IIFE

document.addEventListener("click",(e) => {
  const targetElement = e.target
  const targetInput = !targetElement.closest("input") ? "" : targetElement.closest("input") // looking for input
  const targetArticle = !targetElement.closest("article") ? "" : targetElement.closest("article")
  
  if (targetElement.closest("button")) {
    const btn = targetElement.closest("button")
    const btnId = btn.id
    
    switch (btnId) {
      
      // hamburger menu open
      case 'open-nav-btn':
        mobileMenu()
        searchSuggestList.dataset.visible = "false"
        break;
        
      // hamburger menu close  
      case 'close-nav-btn':
        mobileMenu("close")
        closeBtns()
        break;
        
      // theme menu open/close
      case 'theme-btn':
        if (themeBtn.getAttribute("aria-expanded") === "false") {
          closeBtns()
          controlMenu(themeBtn, themeMenu, "open")
          themeBtn.setAttribute("aria-label",`currently active theme ${themeName}`)
        }
        else {
          controlMenu(themeBtn, themeMenu)
        }
        searchSuggestList.dataset.visible = "false"
        break;
        
      // favourite menu open  
      case 'favourite-btn':
        controlMenu(favBtn, favMenu, "open")
        favList.textContent = ""
        loadFavPlaces()
        if (window.matchMedia("(max-width: 40rem)").matches) {
          mobileMenu("close")
        }
        searchSuggestList.dataset.visible = "false"
        closeBtns()
        break;
        
      // favourite menu close
      case 'close-fav':
        controlMenu(favBtn, favMenu)
        break;
      
      // units menu open/close
      case 'units-btn':
        if (unitsBtn.getAttribute("aria-expanded") === "false") {
          closeBtns()
          controlMenu(unitsBtn, unitsMenu, "open")
        }
        else {
          controlMenu(unitsBtn, unitsMenu)
        }
        searchSuggestList.dataset.visible = "false"
        break;
      
      // units metrix/imperirel toggle btn
      case 'unitsOptBtn':
        toggleUnitType()
        break;
      
      // my location
      case 'search-locate':
        closeBtns()
        userLocationDebounce()
        break;
      
      // add or remove favourite
      case 'addToFav-btn':
        const [name, country, countryCode, longitude, latitude] = addToFavBtn.value.split(",")
        
        if (addToFavBtn.dataset.favourite === "false") {
          addToFavBtn.dataset.favourite = "true"
          savedWeatherData.favourites[`${name}, ${country}`] = `${countryCode},${longitude},${latitude}`
          
          addToFavBtn.setAttribute("aria-label", `remove ${name}, ${country} from favourite list`)
        }
        else {
          addToFavBtn.dataset.favourite = "false"
          delete savedWeatherData.favourites[`${name}, ${country}`]
          
          addToFavBtn.setAttribute("aria-label", `add ${name}, ${country} to favourite list`)
        }
        // save data
        localStorage.setItem("weatherData", JSON.stringify(savedWeatherData))
        
        searchSuggestList.dataset.visible = "false"
        closeBtns()
        break;
        
      // hourly focast day menu open/close
      case 'hourly-forecast-btn':
        if (forecastBtn.getAttribute("aria-expanded") === "false") {
          closeBtns()
          controlMenu(forecastBtn, forecastMenu, "open")
        }
        else {
          controlMenu(forecastBtn, forecastMenu)
        }
        searchSuggestList.dataset.visible = "false"
        break;
        
      // api retry 
      case 'api-retry-btn':
        window.location.reload()
        break;
        
      //
      case 'notify-close-btn':
        btn.disabled = true
        notify.dataset.animation1 = "fade-out"
        break;
    }
    
    // looking for ul and if yes get id
    const listId = !btn.closest("ul") ? "" : btn.closest("ul").id
    
    switch (listId) {
      // favourite list
      case 'fav-list':
        btnSearchOrRemove(btn)
        break;
        
      // search suggest lists place btn
      case 'search-suggestion':
        fetchForcast(btn.value, tempUnit, windUnit, precipUnit)
        searchInput.value = ""
        searchSuggestList.textContent = ""
        break;
    }
  }
  else if (targetInput.id === "search-input") {
    if (!targetInput.value) {
      searchSuggestList.textContent = ""
      recentList()
    }
    else {
      searchSuggestList.dataset.visible = "true"
    }
    closeBtns()
  }
  else if (targetArticle.id === "favourite-menu") {
  // preventing Fav menu from closing when clicked due to else statement
  }
  else {
    closeBtns()
    controlMenu(favBtn, favMenu)
    searchSuggestList.dataset.visible = "false"
    if (window.matchMedia("(max-width: 40rem)").matches) {
      mobileMenu("close")
    }
  }
})

document.addEventListener("change", (e) => {
  const targetName = e.target.name
  const targetValue = e.target.value
  const listId = !e.target.closest("ul") ? "" : e.target.closest("ul").id
  
  switch (targetName) {
    case 'theme':
      themeName = targetValue
      setTheme(themeName, lightMatchMedia, sunrise[0], sunset[0])
      break;
      
    case 'temperature':
      tempUnit = targetValue
      break;
      
    case 'wind-speed':
      windUnit = targetValue
      break;
      
    case 'precipitation':
      precipUnit = targetValue
      break;
    
    case 'hourly-option':
      const hourlyListInfos = createHourlyInfoList(targetValue, hourlyTime, hourlyWeatherCode, hourlyTemp, tempUnit, curTime, sunrise, sunset)
      const inputDate = hourlyTime[targetValue].split("T")[0]
      
      hourlyInfoList.textContent = ""
      hourlyInfoList.append(hourlyListInfos)
      hourlyBtnText.textContent = dateToWeekMonth_Name(inputDate)[0]
      break;
  }
  // update Forcast, unit and unitType
  if (listId === "units-menu") {
    if (tempUnit === "celsius" && windUnit === "kmh" && precipUnit === "mm") {
      unitsType.textContent = "Imperial"
    }
    else if (tempUnit === "fahrenheit" && windUnit === "mph" && precipUnit === "inch") {
      unitsType.textContent = "Metrics"
    }
    fetchForcast(addToFavBtn.value, tempUnit, windUnit, precipUnit)
  }
})

document.addEventListener("input", (e) => {
  const inputElement = e.target.closest("input")
  const inputValue = inputElement.value
  
  switch (inputElement.id ) {
    // favourite menu list search bar
    case 'fav-searchbar':
      updateFavDebounce(inputValue)
      break;
    
    // place search input
    case 'search-input':
      searchDebounce(inputValue)
      break;
  }
})

document.addEventListener("animationend", (e) => {
  const targetElement = e.target
  
  switch (targetElement.id) {
    case 'notify':
      const notifyAnimation1 = notify.dataset.animation1
      if (notifyAnimation1 === "slide-down") {
        notify.dataset.animation1 = "none"
        notify.dataset.animation2 = "line"
      }
      if (notifyAnimation1 === "fade-out" ) {
        notify.dataset.animation1 = "none"
        notify.dataset.visible = "false"
        notifyCloseBtn.disabled = false
      }
      if (notifyAnimation1 === "slide-up") {
        notify.dataset.animation1 = "none"
        notify.dataset.visible = "false"
      }
      if (notifyAnimation1 === "slide-up") {
        notify.dataset.animation2 = "none"
        notifyCloseBtn.disabled = false
      }
      if (e.pseudoElement === "::before") {
        notify.dataset.animation1 = "slide-up"
        notifyCloseBtn.disabled = true
      }
      break;
    
    case 'nav-bar':
      navBar.dataset.animation = "none"
      if (openNavBtn.getAttribute("aria-expanded") === "false") {
        navBar.dataset.visible = "false"
      }
      break;
  }
})