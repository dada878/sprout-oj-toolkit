console.log("plugin loaded");

function injectCustomCSS(type) {
    console.log("tyr to inject custom css");
    const styleEle = document.createElement('style');
    styleEle.innerHTML = `.btn[style="margin-top:1em;"] { padding:0px !important}`;
    document.body.appendChild(styleEle);
    document.querySelector(`div[ng-${type}"showTotalScore"]`).style.maxWidth = "200px";
}

function addLoadAnswerBtn(type) {
    console.log("tyr to add answer button");
    const btnElement = document.createElement('div');
    btnElement.setAttribute("class", "btn");
    btnElement.setAttribute("style", "margin-top:1em;");
    btnElement.innerHTML = `<button class="btn btn-primary" id="chwa-helper-answer-btn" onclick="const evt = document.createEvent('Event');evt.initEvent('loadAnswer', true, false);document.dispatchEvent(evt);" style="display:block;">填入答案</button>`;
    document.querySelector(`div[ng-${type}=showTotalScore]`).appendChild(btnElement);
}

function addGuessBtn(type) {
    console.log("tyr to add guess button");
    const btnElement = document.createElement('div');
    btnElement.setAttribute("class", "btn");
    btnElement.setAttribute("style", "margin-top:1em;");
    btnElement.innerHTML = `<button class="btn btn-danger" id="chwa-helper-guess-btn" onclick="const evt = document.createEvent('Event');evt.initEvent('guessAnswer', true, false);document.dispatchEvent(evt);" style="display:block;margin-left: 4px;">猜題</button>`;
    document.querySelector(`div[ng-${type}=showTotalScore]`).appendChild(btnElement);
}

function isAnswerEmpty() {
    return JSON.stringify(answer) == "{}";
}

function initPage(type="hide") {
    console.log("try to init this page")
    if (document.querySelector(`div[ng-${type}=showTotalScore]`)) {
        addLoadAnswerBtn("show");
        addLoadAnswerBtn("hide");
        injectCustomCSS("show");
        injectCustomCSS("hide");
        addGuessBtn("show");
        addGuessBtn("hide");
    }
    if (type == hide) initPage("show");
}

initPage();

var answer = {};

function saveAnswer() {
    (() => {
        const btns = document.querySelectorAll('.btn:is(.ng-binding):not(.ng-hide):not([id*="sendAns"])');
        const problems = document.querySelectorAll('div[ng-repeat="q in qt.qlist"]:not([style="float: left;"]):is(.ng-scope)');
        for (const pronlem of problems) {
            const description = pronlem.querySelector('p[ng-bind-html="q.q | trustedHtml"]').innerHTML;
            const answerOptionElements = pronlem.querySelectorAll('.rightOption');
            answer[description] = [];
            for (let opts of answerOptionElements) {
                answer[description].push(opts.innerHTML);
            }
        }
        alert(`紀錄成功 共 ${Object.keys(answer).length} 題！`);
    })();
}

document.addEventListener('loadAnswer', () => {
    if (isAnswerEmpty()) {
        alert("暫無儲存的答案，請先至少交卷一次後再使用");
        return;
    }
    (() => {
        const problems = document.querySelectorAll('div[ng-repeat="q in qt.qlist"]:not([style="float: left;"]):is(.ng-scope)');
        const btns = document.querySelectorAll('.btn:is(.ng-binding):not(.ng-hide):not([id*="sendAns"])');
        let wrongCount = 0;
        const problemsWriten = [];
        const failedWriten = [];
        const leftAnswerTable = {};
        const editDistance = function(word1, word2) {
            let dp = Array(word1.length+1).fill(null).map(() => (Array(word2.length + 1).fill(0)));
            for (let i = 0; i < dp.length; i++) dp[i][0] = i
            for (let i = 0; i < dp[0].length; i++) dp[0][i] = i
            for (let i = 1; i < dp.length; i++) {
                for (let j = 1; j < dp[0].length; j++) {
                    dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (word1[i-1] != word2[j-1] ? 1 : 0 ));
                }
            }
            return dp[dp.length - 1][dp[0].length - 1];
        }
        const writeAnswer = function(problem, defaultDescription = null) {
            const description = defaultDescription ?? problem.querySelector('p[ng-bind-html="q.q | trustedHtml"]').innerHTML;
            const options = problem.querySelectorAll('span[ng-click="qt124Sel(option.value)"]');
            let flag = false;
            for (let opt of options) {
                try {
                    for (let ansOpt of answer[description]) {
                        if (ansOpt == opt.innerHTML) {
                            opt.click();
                            flag = true;
                        }
                    } 
                } catch(e) {}
            }
            if (!flag) {
                wrongCount ++;
                let minDistance = Number.MAX_SAFE_INTEGER;
                let minDistanceElement = null;
                for (let opt of options) {
                    try {
                        for (let ansOpt of answer[description]) {
                            let distance = editDistance(ansOpt, opt.innerHTML);
                            if (distance < minDistance) {
                                minDistance = distance;
                                minDistanceElement = opt;
                            }
                        }
                    } catch(e) {
                        wrongCount++;
                    }
                }
                if (minDistanceElement) {
                    flag = true;
                    minDistanceElement.click();
                }
            }
            if (!flag) failedWriten.push(problem);
            else problemsWriten.push(description);
        }
        for (let problem of problems) writeAnswer(problem);
        for (const key of Object.keys(answer)) {
            if (!problemsWriten.includes(key)) leftAnswerTable[key] = answer[key];
        }
        for (const problem of failedWriten) {
            const description = problem.querySelector('p[ng-bind-html="q.q | trustedHtml"]').innerHTML;
            let minDistance = Number.MAX_SAFE_INTEGER;
            let minDistanceDescription = null;
            for (const answerDescription of Object.keys(leftAnswerTable)) {
                let distance = editDistance(answerDescription, description);
                if (distance < minDistance) {
                    minDistance = distance;
                    minDistanceDescription = answerDescription;
                }
            }
            writeAnswer(problem, minDistanceDescription);
        }
        if (wrongCount) alert(`填入完畢 共有 ${wrongCount} 題作答可能錯誤！`)
        for (const btn of btns) btn.click();
    })();
});

document.addEventListener('guessAnswer', () => {
    (() => {
        const problems = document.querySelectorAll('div[ng-repeat="q in qt.qlist"]:not([style="float: left;"]):is(.ng-scope)');
        for (let problem of problems) {
            const description = problem.querySelector('p[ng-bind-html="q.q | trustedHtml"]');
            const options = problem.querySelectorAll('span[ng-click="qt124Sel(option.value)"]');
            options[Math.floor(Math.random()*(3-0+1))+0].click();
        }
        for (const btn of document.querySelectorAll('.btn:is(.ng-binding):not(.ng-hide):not([id*="sendAns"])')) btn.click();
    })();
});

setInterval(() => {
    if (document.querySelector(`div[ng-hide="showTotalScore"].ng-hide`)) { // 結算頁面
        console.log("state = finish page");
        let loadAnswerBtn = document.getElementById("chwa-helper-answer-btn");
        if (!loadAnswerBtn) {
            initPage();
        }
        if (isAnswerEmpty()) {
            saveAnswer();
        }
    } else if (document.querySelector(`div[ng-show="showTotalScore"].ng-hide`)) { // 答題頁面
        console.log("state = quizing page");
        let loadAnswerBtn = document.getElementById("chwa-helper-answer-btn");
        if (!loadAnswerBtn) {
            initPage();
        }
        loadAnswerBtn = document.getElementById("chwa-helper-answer-btn");
        if (isAnswerEmpty()) {
            loadAnswerBtn.style.cursor = "not-allowed";
        } else {
            loadAnswerBtn.style.cursor = "pointer";
        }
    } else {
        console.log("state = other page");
    }
}, 100);