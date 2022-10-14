$(document).ready(function () {
    loadAllItems();
});

function loadAllItems() {
    var rowDiv = "";
    $.ajax({
        type: 'GET',
        url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
        success: function (itemArray) {
            $.each(itemArray, function (index, item) {

                if (itemArray.length >= 1) {
                    if (index == 0 && itemArray.length >= 1) {
                        rowDiv += '<tr>';
                        rowDiv += insertButtonTemplate(item);
                    } else if (index % 3 == 0) {
                        rowDiv += '</tr>';
                        rowDiv += '<tr>';
                        rowDiv += insertButtonTemplate(item);
                    } else {
                        rowDiv += insertButtonTemplate(item);
                    }
                }
            })
            $('#itemTable').append(rowDiv);
        },
        error: function () {
            $('#errorMessages')
                .append($('<li>')
                    .attr({ class: 'list-group-item list-group-item-danger' })
                    .text('Error calling web service. You may need to turn off your ad blocker. Please try again later.'));
        }
    });
}

function insertButtonTemplate(item) {
    var buttonTemplate = '<td>';
    buttonTemplate += '<div class="card" onClick="fillItemSelectionField(' + item.id + ');">';
    buttonTemplate += '<div class="card-body">';
    buttonTemplate += '<p class="itemId">' + item.id + '</p>';
    buttonTemplate += '<p class="itemName">' + item.name + '</p>';
    buttonTemplate += '<p class="itemPrice">$' + item.price.toFixed(2) + '</p>';
    buttonTemplate += '<p class="itemQuantity">' + 'Quantity Left: ' + item.quantity + '</p>';
    buttonTemplate += '</div>';
    buttonTemplate += '</div>';
    buttonTemplate += '</td>';
    return buttonTemplate;

}

function fillItemSelectionField(id) {
    clearSelectionMessagesChange();
    $('#itemSelectionField').val(id);
}

function addQuarter() {
    clearSelectionMessagesChange();
    var num = parseFloat($('#moneyInField').val());
    num += 0.25;
    num = num.toFixed(2);
    $('#moneyInField').val(num);

}

function addDollar() {
    clearSelectionMessagesChange();
    var num = parseFloat($('#moneyInField').val());
    num += 1.00;
    num = num.toFixed(2);
    $('#moneyInField').val(num);
}

function addDime() {
    clearSelectionMessagesChange();
    var num = parseFloat($('#moneyInField').val());
    num += 0.10;
    num = num.toFixed(2);
    $('#moneyInField').val(num);
}

function addNickel() {
    clearSelectionMessagesChange();
    var num = parseFloat($('#moneyInField').val());
    num += 0.05;
    num = num.toFixed(2);
    $('#moneyInField').val(num);
}

function clearSelectionMessagesChange() {
    $('#changeField').val('');
    $('#messageField').val('');
    $('#itemSelectionField').val('');

}

function returnChange() {

    if ($('#changeField').val() != "") {
        $('#moneyInField').val('0.00');
        clearSelectionMessagesChange();
    } else {
        clearSelectionMessagesChange();
        var changeString = calculateChangeRefund();
        $('#changeField').val(changeString);
        $('#moneyInField').val('0.00');
    }
}

function vendItem() {
    var amount = $('#moneyInField').val();
    var id = $('#itemSelectionField').val();


    $.ajax({
        type: 'POST',
        url: 'http://vending.us-east-1.elasticbeanstalk.com/money/' + amount + '/item/' + id,
        dataType: "json",
        success: function (data, status) {
            $('#moneyInField').val('0.00');
            $('#itemSelectionField').val('');
            $('#itemTable').empty();
            loadAllItems();
            var changeString = getChangeString(data.quarters, data.dimes, data.nickels, data.pennies);
            $('#changeField').val(changeString);
            $('#messageField').val('Thank You!!!');


        },
        error: function (data) {
            if (data.status == 422) {
                displayErrorMsg(data);
                $('#itemTable').empty();
                loadAllItems();
            } else {
                $('#errorMessages')
                    .append($('<li>')
                        .attr({ class: 'list-group-item list-group-item-danger' })
                        .text('Error calling web service. Please try again later.'));
            }

        }

    });
}


function displayErrorMsg(data) {
    $.each($.parseJSON(data.responseText), function (key, value) {
        $('#messageField').val(value);
    });
}

function getChangeString(q, n, d, p) {
    var changeString = "";
    var changeArr = [];
    if (q != 0) {
        if (q == 1) {
            changeArr.push(q + ' Quarter');
        } else {
            changeArr.push(q + ' Quarters');
        }
    }
    if (d != 0) {
        if (d == 1) {
            changeArr.push(d + ' Dime');
        } else {
            changeArr.push(d + ' Dimes');
        }
    }
    if (n != 0) {
        if (n == 1) {
            changeArr.push(n + ' Nickel');
        } else {
            changeArr.push(n + ' Nickels');
        }
    }
    if (p != 0) {
        if (p == 1) {
            changeArr.push(p + ' Penny');
        } else {
            changeArr.push(p + ' Pennies');
        }
    }
    for (i = 0; i < changeArr.length; i++) {
        changeString += changeArr[i];
        if (changeArr[i + 1]) {
            changeString += ', ';
        }
    }
    return changeString;
}

function calculateChangeRefund() {
    var q = 0;
    var d = 0;
    var n = 0;
    var p = 0;
    var amountLeft = 0;
    var amount = $('#moneyInField').val();
    if (amount >= 0.25) {
        amountLeft = amount % 0.25;
        amountLeft = Math.round(amountLeft * 100) / 100;
        amount -= amountLeft;
        q = amount / 0.25;
        q = Math.round(q * 100) / 100;
        amount = amountLeft;
    }
    if (amount >= 0.10) {
        amountLeft = amount % 0.10;
        amountLeft = Math.round(amountLeft * 100) / 100;
        amount -= amountLeft;
        d = amount / 0.10;
        d = Math.round(d * 100) / 100;
        amount = amountLeft;
    }
    if (amount >= 0.05) {
        amountLeft = amount % 0.05;
        amountLeft = Math.round(amountLeft * 100) / 100;
        amount -= amountLeft;
        n = amount / 0.05;
        n = Math.round(n * 100) / 100;
        amount = amountLeft;

    }
    if (amount >= 0.01) {
        amountLeft = amount % 0.01;
        amountLeft = Math.round(amountLeft * 100) / 100;
        amount -= amountLeft;
        p = amount / 0.01;
        p = Math.round(p * 100) / 100;
        amount = amountLeft;
    }


    return getChangeString(q, n, d, p);

}




