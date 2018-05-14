var budgetController = (function () {

    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    Expense.prototype.percentage = -1;
    Expense.prototype.calculatePercentage = function () {
        if (data.totals.inc !== 0) {
            this.percentage = Math.round((this.value / data.totals.inc) * 100);
        } else {
            this.percentage = -1;
        }
    }

    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc:0,
            total: 0,
            percentage:-1


        }
        
    }

    return {
        
        addItems: function (type, desc, value) {
            var id, newItem;
            if (data.allItems[type].length >= 1) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                id = 1;
            }
            if (type == 'exp') {
                newItem = new Expense(id, desc, parseFloat(value));
            } else {
                newItem = new Income(id, desc, parseFloat(value));
            }
             
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            var index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            data.totals.inc = data.totals.exp = 0;
            data.allItems.inc.forEach(function (current) {
                data.totals.inc += current.value;
            });
            data.allItems.exp.forEach(function (current) {
                data.totals.exp += current.value;
            });
            data.totals.total = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.totals.percentage = Math.round(((data.totals.exp) / data.totals.inc) * 100);
            }
        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calculatePercentage();
            });
        },
        getBudget: function () {
            return {
                TotalBudget: data.totals.total,
                TotalInc: data.totals.inc,
                TotalExp: data.totals.exp,
                TotalPercentage: data.totals.percentage
            }
        },
        getPercentage: function () {
            return {
                percentageArr: data.allItems.exp.map(function (current) {
                    
                    return current.percentage;
                })
            };
            
        }
    }


})();

var uiController = (function () {
    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expenseElement: '.expenses__list',
        incomeElement: '.income__list',
        totalBudget: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalPercentage: '.budget__expenses--percentage',
        expensePercentage: '.item__percentage',
        container: '.container',
        percentageLable: '.item__percentage',
        dateLable:'.budget__title--month'
      
    };
    var formatNumbers = function (num, type) {
        var numSplit,int,dec
        //1.round upto two decimal points
        num = (Math.abs(num)).toFixed(2);
        //2. add comma for thousands
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }
        //3. return with appropriate sign
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    var nodeLists = function (expList, callback) {
        for (var i = 0; i < expList.length; i++) {
            callback(expList[i], i);
        }
    };
    return{
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                desc: document.querySelector(domStrings.inputDescription).value,
                val: document.querySelector(domStrings.inputValue).value            
            }
        },
        addItemsToUi: function (obj, type) {
            var html, newHtml,element;
            if (type === 'inc') {
                element = document.querySelector(domStrings.incomeElement);
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
            } else {
                element = document.querySelector(domStrings.expenseElement);
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
               

                if (obj.percentage >= 0) {
                    html = html.replace("%percentage%", expPercentage + '%');
                } else html = html.replace("%percentage%", '--');
                
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumbers( obj.value,type));
            

           
            element.insertAdjacentHTML('beforeEnd', newHtml);

        },
        deleteItemsFromUi: function (itemId) {
            var el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
            
        },
        updatePercentage: function (percentages) {
         
            var expList = document.querySelectorAll(domStrings.percentageLable);
           
            nodeLists(expList, function (current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
                
               
            });
        },
        clearFields: function () {
            var fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            var fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function (current) {
                current.value = "";
            });
            fieldArr[0].focus();

        },
        updateTotalBudget: function (obj) {
            var type;
            if (obj.TotalBudget >= 0) {
                type = 'inc';
            } else type = 'exp';
            document.querySelector(domStrings.totalBudget).textContent = formatNumbers(obj.TotalBudget, type);

            document.querySelector(domStrings.totalIncome).textContent = formatNumbers(obj.TotalInc, 'inc');
            document.querySelector(domStrings.totalExpense).textContent = formatNumbers(obj.TotalExp, 'exp');
            if (obj.TotalPercentage > 0) {
                document.querySelector(domStrings.totalPercentage).textContent = obj.TotalPercentage+'%';
            } else {
                document.querySelector(domStrings.totalPercentage).textContent = "--";
            }
   

        },
        displayDate: function () {
            var now, month, months, year;
            now = new Date();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            return months[month] + ' ' + year;
        },
        changedType: function () {
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue
            );
            nodeLists(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },
        dom: function () {
            return domStrings;
        }
        

    };

})();

var globalController = (function (budgetctrl, uictrl) {


    var startEvent = function () {

        document.querySelector(uictrl.dom().inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {

            if (event.key === 'Enter') {
                ctrlAddItem();
            }
        });
        document.querySelector(uictrl.dom().container).addEventListener('click', ctrlDeleteItems);
        document.querySelector(uictrl.dom().inputType).addEventListener('change', uictrl.changedType);
   

    };



    var ctrlAddItem = function () {
        //1. Get inputs
        var input = uictrl.getInput();

        if (input.desc !== '' && !isNaN(parseFloat( input.val))) {
            //2. add items to budget
            var item = budgetctrl.addItems(input.type, input.desc, input.val);


            //3. display items in ui
            uictrl.addItemsToUi(item, input.type);

            //4. Clear fields
            uictrl.clearFields();

            //5. Update total budget
            updateBudget();
            //Update Percentage
            updatePercentage();
        }

        
    };  

    var ctrlDeleteItems = function (event) {
        var itemId, id, type;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
        if (itemId !== null && itemId!=='') {
            id = parseInt(itemId.split('-')[1]);
            type = itemId.split('-')[0];
            

            //1. Delete Items from datastructure
            budgetctrl.deleteItem(type, id);


            //2.Delete Items from Ui
            uictrl.deleteItemsFromUi(itemId);

            //3. Update total budget
            updateBudget();

            //4. Update percentage
            updatePercentage();
        }
        
    };

    var updateBudget = function () {
        budgetctrl.calculateBudget();
        var totalBudgetObj = budgetctrl.getBudget();
        console.log(totalBudgetObj);
        uictrl.updateTotalBudget(totalBudgetObj);

    };

    var updatePercentage = function () {
        budgetctrl.calculatePercentage();
        var percentages = budgetctrl.getPercentage().percentageArr;
       
        uictrl.updatePercentage(percentages);

    };

  



    return {
        Init: function () {
            console.log('Init');
            startEvent();
            uictrl.updateTotalBudget({
                TotalBudget: 0,
                TotalInc: 0,
                TotalExp: 0,
                TotalPercentage:-1
            })

            document.querySelector(uictrl.dom().dateLable).textContent = uictrl.displayDate();
        }
    };
    

    

})(budgetController, uiController);

globalController.Init();
