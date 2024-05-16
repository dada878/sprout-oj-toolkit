function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

let userID;
waitForElm('#navbar .container .grid .grid').then((elm) => {
    userID = document.querySelector("#navbar .container .grid .grid").children[4].children[0].getAttribute("href").split("/")[2];
});

const customCSS = document.createElement("style");
customCSS.innerHTML = `
tr.grid[style]:nth-child(2) {
    border-top: 1px solid #d3d3d3;
}
tr.grid[style]:hover {
    background-color: #e7e7e7 !important;
    cursor: pointer;
}
tr.grid[style]:hover a {
    text-decoration: underline;
}
tr.grid[style]:nth-child(odd) {
    background-color: #f7f7f7;
}

tr.grid[style].bonus .col::before {
    content: "[Bonus] ";
}

progress {
    border-radius: 7px; 
    width: 70%;
    height: 18px;
  }
  progress::-webkit-progress-bar {
    background-color: #f7f7f7;
    border: 1px solid #d3d3d3;
    border-radius: 7px;
  }
  progress::-webkit-progress-value {
    background-color: gray;
    border: 1px solid #d3d3d3;
    border-radius: 7px;
}
`;
document.head.appendChild(customCSS);
function createProgressBar() {
    const ele = document.createElement("div");
    ele.style.marginTop = "2rem";
    ele.id = "state-board";
    ele.innerHTML = `
    <p style="margin-bottom:0.3rem">Solving progress:</p>
    <progress max="100" value="0" id="progress-bar"></progress>
    <p style="margin-bottom:0.3rem">Without bonus:</p>
    <progress max="100" value="0" id="progress-bar-without-bouns"></progress>
    `
    document.querySelector("#group-board .col-2").appendChild(ele);
}
function createSubmissionsButton() {
    const ele = document.createElement("div");
    ele.classList.add("grid");
    ele.innerHTML = `<div class="col"><a href="https://neoj.sprout.tw/status?filter={"user_uid":${userID},"problem_uid":${location.href.split("/")[4]},"result":null}" target="_blank" style="text-decoration: none;"><button id="my-submissions-btn">My Submissions</button></a></div>`;
    document.querySelector("#problem .col-2").children[4].insertAdjacentElement('afterend', ele);
}
setInterval(() => {
    if (location.href == "https://neoj.sprout.tw/group/") document.querySelector("#group-board .col-2 li a").click();
    if (document.querySelector("#group") == null) return;
    if (!document.getElementById("state-board")) createProgressBar();
    const problems = document.getElementById("group").children[0].children;
    const colorSet = {
        "Accepted" : "#7cf07c",
        "Wrong Answer": "#f07c7c",
        "Time Limit Exceeded": "#f07c7c",
        "Compile Error": "#f07c7c",
        "Runtime Error": "#f07c7c"
    }
    const allProblem = problems.length - 1;
    let solvedProblem = 0;
    let bonusProblem = 0;
    let solvedBounsProblem = 0;
    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        if (problem.tagName == "THEAD") continue;
        const [id, name, state, deadline] = [
            problem.children[0],
            problem.children[1].children[0],
            problem.children[2],
            problem.children[3]
        ];
        problem.onclick = () => window.location.href = "https://neoj.sprout.tw/problem/" + id.innerHTML;
        problem.style.borderBottom = "#d3d3d3 1px solid";
        problem.querySelector("a").removeAttribute("href");
        problem.querySelector("a").style.pointerEvents = "none";
        state.style.backgroundColor = colorSet[state.innerHTML];
        solvedProblem += state.innerHTML == "Accepted" ? 1 : 0;
        if (
            window.location.href.includes("group/53") &&
            deadline.innerHTML != "None" &&
            deadline.innerHTML.split(" ")[1].split(":")[0] == "23"
        ) {
            problem.classList.add("bonus");
            bonusProblem++;
            solvedBounsProblem += state.innerHTML == "Accepted" ? 1 : 0;
        }
    }
    document.getElementById("progress-bar").value = solvedProblem / allProblem * 100;
    document.getElementById("progress-bar-without-bouns").value = (solvedProblem - solvedBounsProblem) / (allProblem - bonusProblem) * 100;
}, 100);
setInterval(() => {
    if (document.querySelector("#problem") == null) return;
    if (!document.getElementById("my-submissions-btn")) createSubmissionsButton();
}, 100);