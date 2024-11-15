function safeLoad(key, initVal, filterFunc) {
    let v = localStorage.getItem(key);
    if (v && typeof filterFunc == "function") {
	v = filterFunc(v);
    }
    v = v ? v : initVal;
    return v;
}

let lastTime = safeLoad("lastTime", 0);
let history = safeLoad("history", [], (h)=>JSON.parse(h));

const okTime = ((2*60)+20)*60*1000; // また吸える時間。2時間20分後
//const okTime = 10*1000; // また吸える時間。デバッグ用
const bannerTime = 10*1000; // よくやった！の表示時間

const MSEC_DAY = 24*60*60*1000;
const JST_OFFSET = 9*60*60*1000;

function time2day(t) {
    return Math.floor((t + JST_OFFSET) / MSEC_DAY);
}
function day2time(days) {
    return days * MSEC_DAY - JST_OFFSET;
}

let HonLog = {
    today: 0,
    history: [],
    todayDate: 0,

    save: function () {
	localStorage.setItem("hon", JSON.stringify(this));
    },
    load: function () {
	let v = safeLoad("hon", {today:0, history:[], todayDate: 0}, (h)=>JSON.parse(h));
	this.today = v.today;
	this.history = v.history;
	this.todayDate = v.todayDate;
    },
    refreshDate: function () {
	let now = time2day(Date.now());
	if (this.todayDate == now) { // 日付が変わってなければスキップ
	    return;
	}
	if (this.todayDate) { // 初期値でなければ…
	    let lastDayStr = new Date(day2time(this.todayDate)).toLocaleString("ja-JP", {
		year: "numeric",
		month: "numeric",
		day: "numeric"
	    });
	    this.history.unshift({date: lastDayStr, hon: this.today});
	}
	this.today = 0;
	this.todayDate = now;
	this.save();
    },
    add: function () {
	this.refreshDate();
	this.today++;
	this.save();
    }
};
HonLog.load();

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
    document.getElementById('hon-today').innerText = HonLog.today;
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
    HonLog.refreshDate();
}


function formatTime(t) {
    return new Date(t).toLocaleString("ja-JP", {
	month: "numeric",
	day: "2-digit",
        hour: "2-digit",
	minute: "2-digit"
    });
}

function getDay(t) {
    return new Date(t).getDate();
}

function showHistory() {
    if (history.length == 0) {
	return;
    }
    let rows = [];
    let lastDay = getDay(Date.now());
    history.forEach((e) => {
	let timeStr = formatTime(e.time);
	let intervalStr = formatTimeSpan(e.interval, true);
	let today = getDay(e.time);
	if (today != lastDay) {
	    lastDay = today;
	    rows.push("<tr class=\"daysep\"><td>" + timeStr +
		      "</td><td>" + intervalStr + "</td></tr>");
	} else {
	    rows.push("<tr><td>" + timeStr + "</td><td>" + intervalStr + "</td></tr>");
	}
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
    HonLog.add();
}

function demoSuu() {
    document.getElementById('congratuations').innerHTML = 'やっちまったな! 権兵衛!<br/>次はがんばろう!!';    
    showMain(Status.congratuations);
    let now = Date.now();
    registerSutta(now, lastTime);
    lastTime = now;
    localStorage.setItem("lastTime", lastTime);
    HonLog.add();
}

function drawDayLog() {
    if (HonLog.history.length == 0) {
	return;
    }
    let rows = [];
    HonLog.history.forEach((e) => {
	rows.push("<tr><td>" + e.date + '</td><td class="numcell">' + e.hon + "本</td></tr>");
    });
    document.getElementById("daylog").innerHTML = "<table>" +
	"<tr><th>日付</th><th>吸った本数</th></tr>" +
	rows.join('') +
	"</table>";
}

function showDayLog() {
    drawDayLog();
    document.getElementById("front-page").style.display = 'none';
    document.getElementById("daylog-page").style.display = 'block';
}

function hideDayLog() {
    document.getElementById("front-page").style.display = 'block';
    document.getElementById("daylog-page").style.display = 'none';
}

function onPageLoad() {
    document.getElementById("btn-sutta").addEventListener("click", sutta);
    document.getElementById("btn-demo-suu").addEventListener("click", demoSuu);
    document.getElementById("btn-back").addEventListener("click", hideDayLog);
    document.getElementById("btn-show-daylog").addEventListener("click", showDayLog);
    hideDayLog();
    showHistory();
    setInterval(updateTimer, 100); // 0.1秒ごとに更新
}

document.addEventListener('DOMContentLoaded', onPageLoad);

