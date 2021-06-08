//Create db request for database
const request = window.indexedDB.open("BudgetList", 1);
let db;

request.onupgradeneeded = event => {
    db = event.target.result;

    //Creates an object store
    const BudgetStore = db.createObjectStore("BudgetList", {
        autoIncrement: true
    });
};

request.onsuccess = event => {
    db = event.target.result;

    //If app is online, read db
    if(navigator.onLine) {
        checkDatabase();
    };
};

request.onerror = event => {
    console.log(event.target.errorCode);
};

function saveRecord(data) {
    const transaction = db.transaction(["BudgetList"], "readwrite");
    const BudgetStore = transaction.objectStore("BudgetList");
    BudgetStore.add(data);
};

function checkDatabase() {
    let transaction = db.transaction(["BudgetList"], "readwrite");
    const BudgetStore = transaction.objectStore("BudgetList");
    const getAll = BudgetStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((data) => {
                if(data.length > 0) {
                    transaction = db.transaction(["BudgetList"], "readwrite");
                    const newStore = transaction.objectStore("BudgetList");
                    newStore.clear();
                }
            });
        }
    };
};

window.addEventListener('online', checkDatabase);
