var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1,
  };

  var calculateTotal = function (type) {
    data.totals[type] = data.allItems[type].reduce(function (sum, cur) {
      return sum + cur.value;
    }, 0);

  }

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function (type, id) {
      var ids, index;

      var ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {

      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      })
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      }
    },
    testing: function () {
      console.log(data);
    }
  };

})();

var UIController = (function () {
  var DOMstrings = {
    inputType: document.querySelector('.add__type'),
    inputDescription: document.querySelector('.add__description'),
    inputValue: document.querySelector('.add__value'),
    inputButton: document.querySelector('.add__btn'),
    incomeContainer: document.querySelector('.income__list'),
    expensesContainer: document.querySelector('.expenses__list'),
    budgetLabel: document.querySelector('.budget__value'),
    incomeLabel: document.querySelector('.budget__income--value'),
    expenseLabel: document.querySelector('.budget__expenses--value'),
    percentageLabel: document.querySelector('.budget__expenses--percentage'),
    container: document.querySelector('.container'),
    expensesPercLabel: '.item__percentage',
    dateLabel: document.querySelector('.budget__title--month'),
  }

  function formatNumber(num, type) {
    var numSplit;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    };
    dec = numSplit[1];
    type === 'exp' ? '-' : '+';
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: DOMstrings.inputType.value,
        description: DOMstrings.inputDescription.value,
        value: +DOMstrings.inputValue.value,
      }
    },

    addListItem: function (obj, type) {

      var html, newHTML, element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = "<div class='item clearfix' id='inc-%id%'><div class='item__description'>%description%</div><div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = "<div class='item clearfix' id='exp-%id%'><div class='item__description'>%description%</div><div class = 'right clearfix'><div class='item__value'>%value%</div><div class = 'item__percentage'>%21%</div><div class = 'item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      }

      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      element.insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      [DOMstrings.inputDescription, DOMstrings.inputValue].forEach(function (item) {
        item.value = '';
      });
      DOMstrings.inputDescription.focus();
    },
    displayBudget: function (obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      DOMstrings.budgetLabel.textContent = formatNumber(obj.budget, type);
      DOMstrings.incomeLabel.textContent = formatNumber(obj.totalInc, 'inc');
      DOMstrings.expenseLabel.textContent = formatNumber(obj.totalExp, 'exp');
      DOMstrings.percentageLabel.textContent = obj.percentage;

      if (obj.percentage > 0) {
        DOMstrings.percentageLabel.textContent = obj.percentage + '%';
      } else {
        DOMstrings.percentageLabel.textContent = '-';
      }
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      var now, month, months, year;
      now = new Date();
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'September',
        'October',
        'November',
        'December',
      ];
      month = now.getMonth();
      year = now.getFullYear();
      DOMstrings.dateLabel.textContent = months[month] + ' ' + year;
    },

    changedType: function () {
      [DOMstrings.inputType, DOMstrings.inputDescription, DOMstrings.inputValue].forEach(function (item) {
        item.classList.toggle('red-focus');
      });
      DOMstrings.inputButton.classList.toggle('red');
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };

})();

var controller = (function (budgetctrl, UIctrl) {

  function setupEventListener() {

    var DOM = UIctrl.getDOMstrings();
    DOM.inputButton.addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    DOM.container.addEventListener('click', ctrlDeleteItem);

    DOM.inputType.addEventListener('change', UIctrl.changedType);
  };

  function updateBudget() {
    var budget;
    budgetctrl.calculateBudget();
    budget = budgetctrl.getBudget();
    UIctrl.displayBudget(budget);
  };

  function updatePercentages() {
    budgetctrl.calculatePercentages();
    var percentages = budgetctrl.getPercentages();
    UIctrl.displayPercentages(percentages);
  };

  function ctrlAddItem() {
    var input, newItem;
    input = UIctrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      newItem = budgetctrl.addItem(input.type, input.description, input.value);
      console.log(newItem, input.type);
      UIctrl.addListItem(newItem, input.type);
      UIctrl.clearFields();
      updateBudget();
      updatePercentages();
    }
  };

  function ctrlDeleteItem(e) {
    var itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = +splitID[1];
      budgetctrl.deleteItem(type, ID);
      UIctrl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log('App has started!');
      updateBudget();
      setupEventListener();
      UIctrl.displayMonth();
    }
  };

})(budgetController, UIController);

controller.init();