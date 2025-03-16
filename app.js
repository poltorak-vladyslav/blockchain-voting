// Підключення до Ethereum через MetaMask
async function connectWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("MetaMask підключено!");
    } else {
        alert("Встановіть MetaMask для взаємодії з Ethereum.");
    }
}

// ABI та адреса контракту (замініть на актуальні значення!)
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string[]",
                "name": "candidateNames",
                "type": "string[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "voteForCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidateList",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidates",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "totalVotesFor",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "validCandidate",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "votesReceived",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = "0x45f806D770CC3E55346ff6A1631AfcC9021d2433"; // Адреса вашого контракту

// Підключення до контракту
let contract;
async function initContract() {
    const web3 = window.web3;
    if (!web3) {
        console.error("Web3 не ініціалізовано!");
        return;
    }

    contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("Контракт ініціалізовано:", contract);
}

// Завантаження списку кандидатів
async function loadCandidates() {
    if (!contract) {
        console.error("Контракт не ініціалізовано!");
        return;
    }

    try {
        const candidates = await contract.methods.getCandidates().call();
        console.log("Кандидати:", candidates);

        if (!Array.isArray(candidates) || candidates.length === 0) {
            throw new Error("Список кандидатів порожній або некоректний");
        }

        const select = document.getElementById("candidate");
        select.innerHTML = ""; // Очищення списку перед додаванням нових кандидатів

        candidates.forEach(candidate => {
            let option = document.createElement("option");
            option.value = candidate;
            option.innerText = candidate;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Помилка отримання кандидатів:", error);
    }
}

// Голосування
async function vote() {
    if (!contract) {
        console.error("Контракт не ініціалізовано!");
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        const candidate = document.getElementById("candidate").value;

        await contract.methods.voteForCandidate(candidate).send({ from: accounts[0] });
        alert("Голос успішно відправлено!");
        loadResults();
    } catch (error) {
        console.error("Помилка голосування:", error);
    }
}

// Отримання результатів голосування
async function loadResults() {
    if (!contract) {
        console.error("Контракт не ініціалізовано!");
        return;
    }

    try {
        const candidates = await contract.methods.getCandidates().call();
        let resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        for (let candidate of candidates) {
            let votes = await contract.methods.totalVotesFor(candidate).call();
            resultsDiv.innerHTML += `<p>${candidate}: ${votes} голосів</p>`;
        }
    } catch (error) {
        console.error("Помилка отримання результатів:", error);
    }
}

// Запуск після завантаження сторінки
window.onload = async () => {
    await connectWeb3();
    await initContract();
    await loadCandidates();
    await loadResults();
};