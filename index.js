let lastTime = localStorage.getItem("lastTime"); // 無いとnullが返ってくる
let history = localStorage.getItem("history");
history = history ? JSON.parse(history) : [];

//const okTime = 2*60*60*1000; // また吸える時間。2時間後
const okTime = 30*1000; // また吸える時間。
const bannerTime = 2.5*1000; // よくやった！の表示時間

const Status = {
    ok: 1,
    wait: 2,
    congratuations: 3,
};

function getStatus(currentTime) {
    if (currentTime - lastTime > okTime) {
	return Status.ok;
    } else if (currentTime - lastTime > bannerTime) {
	return Status.wait;
    } else {
	return Status.congratuations;
    }
}

function showMain(status) {
    let elemWait = document.getElementById("wait");
    let elemCongratuations = document.getElementById("congratuations");
    let elemBtn = document.getElementById("btn-sutta");
    elemWait.style.display = 'none';
    elemCongratuations.style.display = 'none';
    elemBtn.style.display = 'none';
    if (status == Status.wait) {
	elemWait.style.display = 'block';
    } else if (status == Status.ok) {
	elemBtn.style.display = 'block';
    } else {
	elemCongratuations.style.display = 'block';
    }
}

function formatTimeSpan(span, noMSec) {
    let hour = Math.floor(span / (60*60*1000));
    let min = Math.floor((span % (60*60*1000))/(60*1000));
    let sec = (span % (60*1000))/1000;
    sec = (noMSec ? Math.floor(sec) : sec.toFixed(1));
    let str = "";
    if (hour > 0) {
	str = hour + '時間' + min + '分' + sec + '秒';
    } else if (min > 0) {
	str = min + '分' + sec + '秒';	
    } else {
	str = sec + '秒';
    }
    return str;
}

function updateTimer() {
    let currentTime = Date.now();

    let elapsedTime = currentTime - lastTime;
    document.getElementById('timer').innerText = formatTimeSpan(elapsedTime);

    let remainTime = -(currentTime - okTime - lastTime);
    document.getElementById('wait-remain').innerText = formatTimeSpan(remainTime);

    let status = getStatus(currentTime)
    showMain(status);
}

setInterval(updateTimer, 100); // 0.1秒ごとに更新

function formatTime(t) {
    return new Date(t).toLocaleString("ja-JP", {
	month: "numeric",
	day: "2-digit",
        hour: "2-digit",
	minute: "2-digit"
    });
}

function showHistory() {
    if (history.length == 0) {
	return;
    }
    let rows = [];
    history.forEach((e) => {
	let timeStr = formatTime(e.time);
	let intervalStr = formatTimeSpan(e.interval, true);
	rows.push("<tr><td>" + timeStr + "</td><td>" + intervalStr + "</td></tr>");
    });
    document.getElementById('history').innerHTML = 
	"<table><tr><th>吸った時刻</th><th>前回からの経過時間</th></tr>" +
	rows.join('') +
	"</table>";
}

function registerSutta(now, last) {
    history.unshift({time: now, interval: now - last});
    localStorage.setItem("history", JSON.stringify(history));
    showHistory();
}

function sutta() {
    document.getElementById('congratuations').innerHTML = 'よくやった！権兵衛';
    showMain(Status.congratuations);
    let now = Date.now();
    registerSutta(now, lastTime);
    lastTime = now;
    localStorage.setItem("lastTime", lastTime);
}

function demoSuu() {
    document.getElementById('congratuations').innerHTML = 'やっちまったな! 権兵衛!<br/>次はがんばろう!!';    
    showMain(Status.congratuations);
    let now = Date.now();
    registerSutta(now, lastTime);
    lastTime = now;
    localStorage.setItem("lastTime", lastTime);
}

function onPageLoad() {
    document.getElementById("btn-sutta").addEventListener("click", sutta);
    document.getElementById("btn-demo-suu").addEventListener("click", demoSuu);
    showHistory();
}

document.addEventListener('DOMContentLoaded', onPageLoad);

