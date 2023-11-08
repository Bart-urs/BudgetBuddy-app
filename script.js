let mainBalanceParagraph = document.querySelector('#main-balance');
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let totals = JSON.parse(localStorage.getItem('totals')) || { PLN: 0, EUR: 0, USD: 0 };
let totalExpenses = JSON.parse(localStorage.getItem('totalExpenses')) || { PLN: 0, EUR: 0, USD: 0 };
let totalIncome = JSON.parse(localStorage.getItem('totalIncome')) || { PLN: 0, EUR: 0, USD: 0 };
let salaryHistory = JSON.parse(localStorage.getItem('salaryHistory')) || [];

updateTotal(); 
updateSalaryHistory(); 
updateExpensesList(); 

const form = document.querySelector('#expense-form');
const incomeForm = document.querySelector('#income-form');

document.getElementById('transaction-type').addEventListener('change', function() {
    var transactionType = this.value;
    var submitButton = document.getElementById('submit-button');
    if (transactionType === 'wydatek') {
        submitButton.value = 'Dodaj wydatek';
    } else if (transactionType === 'przychód') {
        submitButton.value = 'Dodaj przychód';
    }
});
incomeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const amount = parseFloat(event.target.querySelector('#income-amount').value);
    const currency = event.target.querySelector('#income-currency').value;

    if (amount < 0) {
        totals[currency] = (totals[currency] || 0) - Math.abs(amount);
    } else {
        totals[currency] = (totals[currency] || 0) + amount;
    }
    salaryHistory.push({ amount, currency, date: new Date() });

    updateTotal();

    let balances = [];
    for (let currency in totals) {
        if (totals[currency] !== 0) {
            balances.push(`${totals[currency]} ${currency}`);
        }
    }
    mainBalanceParagraph.textContent = `Główne konto: ${balances.join(', ')}`;
    mainBalanceParagraph.classList.remove('balance-positive', 'balance-negative');

    if (totals[currency] < 0) {
        mainBalanceParagraph.classList.add('balance-negative');
    } else if (totals[currency] > 0) {
        mainBalanceParagraph.classList.add('balance-positive');
    }

    event.target.querySelector('#income-amount').value = '';

    updateSalaryHistory();

    event.target.reset();

    const submitButton = document.querySelector('#submit-button');
    submitButton.value = 'Dodaj wydatek';

    localStorage.setItem('salaryHistory', JSON.stringify(salaryHistory));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('totalExpenses', JSON.stringify(totalExpenses));
    localStorage.setItem('totalIncome', JSON.stringify(totalIncome));
});
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const transactionType = event.target.querySelector('#transaction-type').value;
    const amount = parseFloat(event.target.querySelector('#amount').value);
    const currency = event.target.querySelector('#currency').value;
    const name = event.target.querySelector('#name').value;
    const date = event.target.querySelector('#date').value;

    expenses.push({ name, amount, date, currency, transactionType });

    if (transactionType === 'wydatek') {
        totalExpenses[currency] += amount;
        totals[currency] -= amount;
    } else if (transactionType === 'przychód') {
        totalIncome[currency] += amount;
        totals[currency] += amount;
    }

    updateTotal();

    sortExpenses();

    updateExpensesList();

    event.target.querySelector('#name').value = '';
    event.target.querySelector('#amount').value = '';
    event.target.querySelector('#date').value = '';
    event.target.querySelector('#transaction-type').value = 'wydatek';
    event.target.querySelector('#currency').value = 'PLN';

    event.target.reset();

    const submitButton = document.querySelector('#submit-button');
    submitButton.value = 'Dodaj wydatek';

    localStorage.setItem('salaryHistory', JSON.stringify(salaryHistory));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('totalExpenses', JSON.stringify(totalExpenses));
    localStorage.setItem('totalIncome', JSON.stringify(totalIncome));
});

document.addEventListener('DOMContentLoaded', function() {
    mainBalanceParagraph.classList.add('unique-style');

    const sortDirection = document.querySelector('#sort-direction');
    const sortCriterion = document.querySelector('#sort-criterion');

    sortDirection.addEventListener('change', sortExpenses);
    sortCriterion.addEventListener('change', sortExpenses);
});
function sortExpenses() {
    const direction = document.querySelector('#sort-direction').value;
    const criterion = document.querySelector('#sort-criterion').value;

    expenses.sort((a, b) => {
        if (a[criterion] < b[criterion]) {
            return direction === 'ascending' ? -1 : 1;
        }
        if (a[criterion] > b[criterion]) {
            return direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    updateExpensesList();
}
function createExpenseHTML(expense) {
    return `
        <li class="expense-item">
            <div class="tooltip">
                <span class="expense-name">${expense.name}</span>
                <span class="tooltiptext">${expense.name}</span>
            </div>
            <span class="expense-amount">${expense.amount} ${expense.currency}</span>
            <span class="expense-date">${expense.date}</span>
            <div class="button-container">
                <button class="edit-button">Edytuj</button>
                <button class="delete-button">Usuń</button>
            </div>
        </li>
    `;
}
function updateTotal() {
    let expensesTotals = { PLN: 0, EUR: 0, USD: 0 };
    let incomeTotals = { PLN: 0, EUR: 0, USD: 0 };

    expenses.forEach(function(expense) {
        if (expense.transactionType === 'wydatek') {
            expensesTotals[expense.currency] += expense.amount;
        } else if (expense.transactionType === 'przychód') {
            incomeTotals[expense.currency] += expense.amount;
        }
    });

    const expensesTotalParagraph = document.querySelector('#total-expenses');
    const incomeTotalParagraph = document.querySelector('#total-income');
    const mainBalanceParagraph = document.querySelector('#main-balance');
    mainBalanceParagraph.innerHTML = ''; 

    const mainBalanceTextSpan = document.createElement('span');
    mainBalanceTextSpan.textContent = 'Główne konto: ';
    mainBalanceTextSpan.style.color = '#0984e3'; 
    mainBalanceParagraph.appendChild(mainBalanceTextSpan);

    mainBalanceParagraph.style.color = 'initial';

    const balanceValuesSpan = document.createElement('span');
    mainBalanceParagraph.appendChild(balanceValuesSpan);

    expensesTotalParagraph.textContent = `Suma wydatków: ${expensesTotals.PLN} PLN, ${expensesTotals.EUR} EUR, ${expensesTotals.USD} USD`;
    incomeTotalParagraph.textContent = `Suma przychodów: ${incomeTotals.PLN} PLN, ${incomeTotals.EUR} EUR, ${incomeTotals.USD} USD`;

    let totalBalance = 0;
    for (let currency in totals) {
        const balanceValueSpan = document.createElement('span'); 
        balanceValueSpan.textContent = ` ${totals[currency]} ${currency}`; 

        if (totals[currency] < 0) {
            balanceValueSpan.classList.add('balance-negative');
        } else if (totals[currency] > 0) {
            balanceValueSpan.classList.add('balance-positive');
        }

        balanceValuesSpan.appendChild(balanceValueSpan); 
        balanceValuesSpan.innerHTML += ', '; 
        totalBalance += totals[currency]; 
    }

    balanceValuesSpan.innerHTML = balanceValuesSpan.innerHTML.slice(0, -2);

    mainBalanceParagraph.innerHTML = mainBalanceParagraph.innerHTML.slice(0, -2); 
}

function handleEdit(expense, newExpense) {
    const oldAmount = expense.amount;

    const expensesList = document.querySelector('#expenses');

    newExpense.innerHTML = `
        <div class="edit-container">
            <input type="text" value="${expense.name}" title="${expense.name}">
            <input type="number" value="${expense.amount}" title="${expense.amount}">
            <input type="date" value="${expense.date}" title="${expense.date}">
            <div class="button-container">
                <button class="save-button">Zapisz</button>
                <button class="cancel-button">Anuluj</button>
            </div>
        </div>
    `;

    newExpense.querySelector('.save-button').addEventListener('click', function() {
        const newName = newExpense.querySelector('input[type="text"]').value;
        const newAmount = parseFloat(newExpense.querySelector('input[type="number"]').value);
        const newDate = newExpense.querySelector('input[type="date"]').value;

        if (!newName || !newAmount || !newDate) {
            alert('Wszystkie pola muszą być wypełnione!');
            return;
        }

        expense.name = newName;
        expense.amount = newAmount;
        expense.date = newDate;

        if (expense.transactionType === 'wydatek') {
            totalExpenses[expense.currency] -= oldAmount;
            totalExpenses[expense.currency] += newAmount;
            totals[expense.currency] += oldAmount;
            totals[expense.currency] -= newAmount;
        } else if (expense.transactionType === 'przychód') {
            totalIncome[expense.currency] -= oldAmount;
            totalIncome[expense.currency] += newAmount;
            totals[expense.currency] -= oldAmount;
            totals[expense.currency] += newAmount;
        }

        updateTotal();

        sortExpenses();

        updateExpensesList();

        newExpense.innerHTML = `
            <div class="details-container">
                <span class="expense-name">${newName}</span>
                <span class="expense-amount">${newAmount} ${expense.currency}</span>
                <span class="expense-date">${newDate}</span>
            </div>
            <div class="button-container">
                <button class="edit-button">Edytuj</button>
                <button class="delete-button">Usuń</button>
            </div>
        `;

        newExpense.querySelector('.edit-button').addEventListener('click', function() {
            handleEdit(expense, newExpense);
        });

        newExpense.querySelector('.delete-button').addEventListener('click', function() {
            const index = expenses.indexOf(expense);
            if (index !== -1) {
                expenses.splice(index, 1);
            }

            expensesList.removeChild(newExpense);

            if (expense.transactionType === 'wydatek') {
                totalExpenses[expense.currency] -= expense.amount;
                totals[expense.currency] += expense.amount; 
            } else if (expense.transactionType === 'przychód') {
                totalIncome[expense.currency] -= expense.amount;
                totals[expense.currency] -= expense.amount; 
            }

            updateTotal();
        });
    });

    newExpense.querySelector('.cancel-button').addEventListener('click', function() {
        newExpense.innerHTML = `
            <div class="details-container">
                <span class="expense-name">${expense.name}</span>
                <span class="expense-amount">${expense.amount} ${expense.currency}</span>
                <span class="expense-date">${expense.date}</span>
            </div>
            <div class="button-container">
                <button class="edit-button">Edytuj</button>
                <button class="delete-button">Usuń</button>
            </div>
        `;

        newExpense.querySelector('.edit-button').addEventListener('click', function() {
            handleEdit(expense, newExpense);
        });

        newExpense.querySelector('.delete-button').addEventListener('click', function() {
            const index = expenses.indexOf(expense);
            if (index !== -1) {
                expenses.splice(index, 1);
            }

            expensesList.removeChild(newExpense);

            if (expense.transactionType === 'wydatek') {
                totalExpenses[expense.currency] -= expense.amount;
                totals[expense.currency] += expense.amount; 
            } else if (expense.transactionType === 'przychód') {
                totalIncome[expense.currency] -= expense.amount;
                totals[expense.currency] -= expense.amount; 
            }

            updateTotal();
        });
    });
}

function updateExpensesList() {
    const expensesList = document.querySelector('#expenses');

    while (expensesList.firstChild) {
        expensesList.removeChild(expensesList.firstChild);
    }

    for (const expense of expenses) {
        const newExpense = document.createElement('li');
        newExpense.className = 'expense-item';

        if (expense.transactionType === 'przychód') {
            newExpense.classList.add('income');
        }

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'details-container';

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';

        const tooltipText = document.createElement('span');
        tooltipText.className = 'tooltiptext';
        tooltipText.textContent = expense.name;

        tooltip.appendChild(tooltipText);

        const shortName = document.createElement('span');
        shortName.className = 'expense-name';
        shortName.textContent = expense.name.substring(0, 10);

        tooltip.appendChild(shortName);

        detailsContainer.appendChild(tooltip);

        detailsContainer.innerHTML += `<span class="expense-amount">${expense.amount} ${expense.currency}</span> <span class="expense-date">${expense.date}</span>`;

        newExpense.appendChild(detailsContainer);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edytuj';
        editButton.className = 'edit-button';

        buttonContainer.appendChild(editButton);

        editButton.addEventListener('click', function() {
            handleEdit(expense, newExpense);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.className = 'delete-button';

        buttonContainer.appendChild(deleteButton);

        newExpense.appendChild(buttonContainer);

        expensesList.appendChild(newExpense);

        if (expense.amount < 0) {
            newExpense.classList.add('negative');
        } else {
            newExpense.classList.add('positive');
        }

        deleteButton.addEventListener('click', function() {
            const index = expenses.indexOf(expense);
            if (index !== -1) {
                expenses.splice(index, 1);
            }

            expensesList.removeChild(newExpense);

            if (expense.transactionType === 'wydatek') {
                totalExpenses[expense.currency] -= expense.amount;
                totals[expense.currency] += expense.amount; 
            } else if (expense.transactionType === 'przychód') {
                totalIncome[expense.currency] -= expense.amount;
                totals[expense.currency] -= expense.amount; 
            }

            updateTotal();
        });

        updateTotal();
    }
}

function updateSalaryHistory() {
    const salaryHistoryElement = document.querySelector('#salary-history');

    while (salaryHistoryElement.firstChild) {
        salaryHistoryElement.removeChild(salaryHistoryElement.firstChild);
    }

    for (const transaction of salaryHistory) {
        const newTransaction = document.createElement('li');
        const transactionDate = new Date(transaction.date); 
        newTransaction.textContent = `Dodano ${transaction.amount} ${transaction.currency} na dzień ${transactionDate.toLocaleDateString()}`;
        salaryHistoryElement.appendChild(newTransaction);

        const hr = document.createElement('hr');
        salaryHistoryElement.appendChild(hr);
    }
}