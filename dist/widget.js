let jsonData = [];
let targetObject = {};
let audioUrl = '';

async function loadAndDisplayData() {
    try {
        const response = await fetch('array.json');
        const jsonData = await response.json();

        console.log(jsonData);
        // jsonData = data;

        const targetTokenId = getQueryParam("token_id");
        targetObject = jsonData.find((item) => item.token_id === targetTokenId);

        if (targetObject) {
            updateUIWithObjectData(targetObject);
            console.log("Found object:", targetObject);
        } else {
            console.log("Object with token_id " + targetTokenId + " not found.");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updateUIWithObjectData(targetObject) {
    // Update the UI with the data from the targetObject
    document.querySelector("#audioTitle").textContent = targetObject.title;
    document.querySelector("#audioArtist").textContent = targetObject.artist;
    document.querySelector("#reservePrice").textContent = targetObject.reserve_price + ' ETH';
    document.querySelector("#catalogUrl").href = targetObject.url;
    document.querySelector("#catalogSiteUrl").href = targetObject.url;
    document.querySelector("#buyNowUrl").href = targetObject.url;
    document.querySelector("#tokenContractUrl").href = `https://etherscan.io/nft/${targetObject.token_contract}/${targetObject.token_id}`;
    document.querySelector("#mimeType").textContent = targetObject.mimetype;
    document.querySelector("#duration").textContent = targetObject.duration;
    document.querySelector("#mintDate").textContent = targetObject.mint_date;

    if (targetObject.v2auction) {
        document.querySelector("#ownerAddress").href = `https://etherscan.io/address/${targetObject.v2auction.winner}`;
        document.querySelector("#ownerAddress").textContent = targetObject.v2auction.winner.substring(0, 16) + '...';
        document.querySelector("#currentBid").textContent = `${targetObject.v2auction.current_bid_amount}` + ' ETH';
    };
    
    audioUrl = targetObject.lossy_audio;
    const imageUrl = targetObject.artwork;
    const targetElement = document.getElementById("albumArt");
    targetElement.style.backgroundImage = `url('${imageUrl}')`;

    // Assuming 'item' is the data object for the current track.
    let ownerElement = document.getElementById('ownerDiv');
    let reservePriceElement = document.getElementById('reservePriceDiv');

    // Initially hide bid and reserve price elements
    ownerElement.classList.add('hidden');
    reservePriceElement.classList.add('hidden');

    // Check if v2auctions key is present and has values
    if (targetObject.v2auction) {
        if (targetObject.v2auction.winner && targetObject.v2auction.current_bid_amount) {
            // v2auctions key is present and has a winning bid)
            ownerElement.classList.remove('hidden');
            ownerElement.classList.add('flex');
        }
        } else if (targetObject.reserve_price) {
            // v2auctions key is present but has no winning bid
            reservePriceElement.classList.remove('hidden');
            reservePriceElement.classList.add('flex');
        }

    // Setup Wavesurfer and other functionalities that depend on targetObject
    setupWavesurfer(audioUrl);
}

function setupWavesurfer(audioUrl) {
    if (document.readyState !== "loading") {
        initializeWavesurfer(audioUrl);
    } else {
        document.addEventListener("DOMContentLoaded", () => initializeWavesurfer(audioUrl));
    }
}

function initializeWavesurfer(audioUrl) {
    var wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "grey",
        progressColor: "black",
        backend: "MediaElement",
        height: 50,
    });

    wavesurfer.load(audioUrl);

    const playButton = document.querySelector(".play-button");
    playButton.addEventListener("click", function () {
        wavesurfer.playPause();

        if (wavesurfer.isPlaying()) {
            this.textContent = "❚❚";
        } else {
            this.textContent = "►";
        }
    });

    // Sync slider with Wavesurfer's current time
    const slider = document.querySelector(".slider");
    wavesurfer.on("audioprocess", function () {
        slider.value =
            (wavesurfer.getCurrentTime() / wavesurfer.getDuration()) * 100;
    });

    // Seek audio when slider is changed
    slider.addEventListener("input", function () {
        wavesurfer.seekTo(this.value / 100);
    });
}
// Call the function to load and display data
loadAndDisplayData();