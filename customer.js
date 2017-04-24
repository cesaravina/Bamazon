// Dependencies
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'Bamazon'
});

// SQL connection
connection.connect(function(err){
	if(err) {throw err; console.log(err)}
	console.log('Connected as ID ' + connection.threadId + '\n\n');
	start();
});

// Products table query
var start = function(){
	connection.query('SELECT * FROM Products', function(err, res){
		console.log('*********************************');
		console.log('Available Products');
		console.log('*********************************');
		// new table
		var table = new Table({
			head: ['ItemID', 'ProductName', 'Price', 'Quality'],
			colWidths: [10, 40, 10, 10]
		});
        for (var i=0; i < res.length; i++) {
            var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
            table.push(productArray);
        }
        console.log(table.toString());
        buyItem();
        });
    };


// Item prompt
var buyItem = function(){
	inquirer.prompt([
	{
		name: "Item",
		type: "input",
		message: "Which item would you like to buy? Choose the ID",
		validate: function(value){
			if(isNaN(value) === false){
				return true;
			}else{
				console.log("\nItem number only, please...\n");
				return false;
			}
		}
	},
	// Quantity prompt
	{
		name: "Qty",
		type: "input",
		message: "How many?",
		validate: function(value){
			if(isNaN(value) === false){
				return true;
			}else{
				console.log("\nEnter a valid quantity, please...\n");
				return false;
			}
		}

	}]).then(function(answer){
		var ItemInt = parseInt(answer.Qty);
		// DB query
		connection.query("SELECT * FROM Products WHERE ?", [{ItemID: answer.Item}], function(err, data){
			if(err) throw err;
			if (data[0].StockQuantity < ItemInt) {
				console.log("Out of stock!\n");
				console.log("Choose something else.\n");
				start();
			}else{
				var updateQty = data[0].StockQuantity - ItemInt;
				var totalPrice = data[0].Price * ItemInt;
				connection.query("UPDATE Products SET StockQuantity = ? WHERE ITEMID = ?", [updateQty, answer.Item], function(err, results){
					if(err){
					 throw err;
					}else{
						console.log("Item(s) purchased!\n");
						console.log("Total Cost: $" + totalPrice);
						// continue prompt
						inquirer.prompt({
							name: "buyMore",
							type: "confirm",
							message: "Need something else?",
						}).then(function(answer){
							if(answer.buyMore === true){
								start();
							}else{
								console.log("Thanks!");
								connection.end();
                            }
                        });
                        }
                    });
                }               
            });
        });
    };

