function injectCustomCSS() {
    const styleEle = document.createElement('style');
    styleEle.innerHTML = `.btn[style="margin-top:1em;"] { padding:0px !important}`;
    document.body.appendChild(styleEle);
    document.querySelector(`div[ng-hide="showTotalScore"]`).style.maxWidth = "200px";
}

function addLoadAnswerBtn() {
    const btnElement = document.createElement('div');
    btnElement.setAttribute("class", "btn");
    btnElement.setAttribute("style", "margin-top:1em;");
    btnElement.innerHTML = `<button class="btn btn-primary" id="chwa-helper-answer-btn" onclick="const evt = document.createEvent('Event');evt.initEvent('loadAnswer', true, false);document.dispatchEvent(evt);" style="display:block;">填入答案</button>`;
    document.querySelector(`div[ng-hide=showTotalScore]`).appendChild(btnElement);
}

function addGuessBtn() {
    const btnElement = document.createElement('div');
    btnElement.setAttribute("class", "btn");
    btnElement.setAttribute("style", "margin-top:1em;");
    btnElement.innerHTML = `<button class="btn btn-danger" id="chwa-helper-guess-btn" onclick="const evt = document.createEvent('Event');evt.initEvent('guessAnswer', true, false);document.dispatchEvent(evt);" style="display:block;margin-left: 4px;">猜題</button>`;
    document.querySelector(`div[ng-hide=showTotalScore]`).appendChild(btnElement);
}

function isAnswerEmpty() {
    return JSON.stringify(answer) == "{}";
}

function initPage() {
    if (document.querySelector(`div[ng-hide=showTotalScore]`)) {
        addLoadAnswerBtn();
        injectCustomCSS();
        addGuessBtn();
    }
}

initPage();

var answer = {};

function saveAnswer() {
    const topics = document.querySelectorAll('li[ng-repeat="q in qt.qlist"]');
    for (let topic of topics) {
        const description = topic.querySelector('p[ng-bind-html="q.q | trustedHtml"]').innerHTML;
        const optionElements = topic.querySelectorAll('span[ng-click="qt124Sel(option.value)"]');
        const options = [];
        for (let option of optionElements) {
            options.push(option.innerHTML);
        }
        options.sort();
        const optionsTxt = options.join("");
        const answerOptions = topic.querySelectorAll('.rightOption');
        answer[description + optionsTxt] = [];
        for (let opts of answerOptions) {
            answer[description + optionsTxt].push(opts.innerHTML);
        }
    }
}

document.addEventListener('loadAnswer', () => {
    if (isAnswerEmpty()) {
        alert("暫無儲存的答案，請先至少交卷一次後再使用");
        return;
    }
    const topics = document.querySelectorAll('li[ng-repeat="q in qt.qlist"]');
    for (let topic of topics) {
        const description = topic.querySelector('p[ng-bind-html="q.q | trustedHtml"]').innerHTML;
        const optionElements = topic.querySelectorAll('span[ng-click="qt124Sel(option.value)"]');
        const options = [];
        for (let opt of optionElements) {
            options.push(opt.innerHTML);
        }
        options.sort();
        const optionsTxt = options.join("");
        for (let opt of optionElements) {
            try {
                for (let ansOpt of answer[description + optionsTxt]) {
                    if (ansOpt == opt.innerHTML) {
                        opt.click();
                    }
                }
            } catch {}
        }
    }
});

document.addEventListener('guessAnswer', () => {
    const topics = document.querySelectorAll('li[ng-repeat="q in qt.qlist"]');
    for (let topic of topics) {
        const options = topic.querySelectorAll('span[ng-click="qt124Sel(option.value)"]');
        let choiceOption;
        while (choiceOption === undefined || choiceOption.classList.contains("selected")) {
            choiceOption = options[Math.floor(Math.random()*(3-0+1))+0];
        }
        choiceOption.click();
    }
});

setInterval(() => {
    if (document.querySelector(`div[ng-hide="showTotalScore"].ng-hide`)) { // 結算頁面
        if (isAnswerEmpty()) {
            saveAnswer();
        }
    } else if (document.querySelector(`div[ng-show="showTotalScore"].ng-hide`)) { // 答題頁面
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
    }
}, 100);