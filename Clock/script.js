function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const text = `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
    document.getElementById("time").innerText = text;
}


function pad(num) {
    return num < 10 ? '0' + num : num;
}


setInterval(updateClock, 1000);
updateClock();