// Instead of using result.innerHTML, which is incorrect for an input field, you should use result.value to set the value of the input field.

const apiKey = "d3cbfd52a5e47296e44134fd8146a485";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".Box .searchBar input");
const searchBtn = document.querySelector(".searchImg button");
const weatherIcon = document.querySelector(".weather-icon");
const muteBtn1 = document.getElementById('muteButton1');
const muteBtn2 = document.getElementById('muteButton2');

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        let data = await response.json();

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "images/clouds.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "images/clear.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "images/mist.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "images/rain.png";
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
        muteBtn2.style.display = "block";
    }
    micBtn.style.backgroundColor = '#ebfffc';
}

function speakWeather(data) {
    const message = `The temperature in ${data.name} is ${Math.round(data.main.temp)} degrees Celsius. The humidity is ${data.main.humidity}%. The wind speed is ${data.wind.speed} km/h.`;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-US';

    speechSynthesis.speak(speech);

    muteBtn1.style.display = "block";
    muteBtn2.style.display = "none";

    speech.onend = () => {
        // After speech is completed, disable muteBtn2 and enable muteBtn1
        muteBtn1.style.display = "none";
        muteBtn2.style.display = "block";
    };
}
function stopSpeaking() {
    speechSynthesis.cancel();
}
window.addEventListener('beforeunload', stopSpeaking);

muteBtn2.addEventListener("click", () => {

    const cityName = document.querySelector('.city').textContent;
    const temperature = document.querySelector('.temp').textContent;
    const humidity = document.querySelector('.humidity').textContent;
    const windSpeed = document.querySelector('.wind').textContent;

    const data = {
        name: cityName,
        main: { temp: parseFloat(temperature), humidity: parseInt(humidity), },
        wind: { speed: parseFloat(windSpeed), },
    };

    speakWeather(data);
});
muteBtn1.addEventListener("click", () => {
    stopSpeaking();
    muteBtn1.style.display = "none";
    muteBtn2.style.display = "block";
});

// searchBox.addEventListener("keypress", function (event) {
//     if (event.key === "Enter") {
//         event.preventDefault();
//         stopSpeaking();
//         searchBtn.click();
//     }
// });

function hideKeyboard() {
    // Create an invisible input element and focus on it to blur the active input element (city name input)
    const invisibleInput = document.createElement("input");
    invisibleInput.style.position = "absolute";
    invisibleInput.style.opacity = "0";
    document.body.appendChild(invisibleInput);
    invisibleInput.focus();
    // Remove the invisible input element after a short delay to avoid side effects
    // setTimeout(() => {
    //     document.body.removeChild(invisibleInput);
    // }, 100);
    document.body.removeChild(invisibleInput);
}

searchBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        stopSpeaking();
        checkWeather(searchBox.value);
        hideKeyboard();
    }
});

searchBtn.addEventListener("click", () => {
    stopSpeaking();
    checkWeather(searchBox.value);
    hideKeyboard();
});

const micBtn = document.querySelector('.microphone button');
const audio = new Audio("https://www.fesliyanstudios.com/play-mp3/387");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    micBtn.style.display = "none";
}

function activateMic() {
    const recognition = new SpeechRecognition();
    const result = document.querySelector('.Box .searchBar input');

    recognition.lang = 'en-US';

    recognition.onstart = function () {
        // searchBox.value = "Speak now";
        searchBox.value = '';
        var myString = "Listening..."
        var index = 0;
        var intervalId = setInterval(function () {
            searchBox.value += myString.charAt(index);
            index++;
            if (index == myString.length) {
                clearInterval(intervalId);
            }
        }, 50);
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        result.value = transcript;
    };

    recognition.onend = async () => {
        checkWeather(result.value);
        const city = result.value;
        const data = await fetch(apiUrl + city + `&appid=${apiKey}`).then(response => response.json());
        speakWeather(data);
        // micBtn.style.backgroundColor = '#ebfffc';
    }

    recognition.onerror = function (event) {
        result.value = "Recognition error occurred: " + event.error;
    };

    recognition.start();
}

micBtn.addEventListener("click", () => {
    muteBtn1.style.display = "none";
    muteBtn2.style.display = "block";
    stopSpeaking();
    audio.play();
    micBtn.style.backgroundColor = '#cccece';
    activateMic();
});
