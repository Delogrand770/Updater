var Util = {
	errorData: {flag: false, msg: ""},
	isChecked:function(id){
		return document.getElementById(id).checked;
	},
	array_merge:function(arr1, arr2){
		var result = [];
		return result.concat(arr1, arr2);
	},
	getPage:function(url, callback, passon) {
		var protocol = url.split(':')[0];
		
		var req = require(protocol);
		var rand = "?rand=" + Math.round(new Date());
		req.get(url + rand, function(res) {

			var data = "";
			res.on('data', function (chunk) {
				data += chunk;
			});

			res.on("end", function(res) {
				callback(data, passon);
			});

		}).on("error", function(error) {
			Util.log("Error: Unable to get " + url, "#ff0000");
			Util.log(error, "#ff0000");
			callback(null);
		});
	},
	getBetween:function(content, start, end){
		var result = content.split(start);
		if (result[1]){
			var result = result[1].split(end);
			return result[0];
		}
		return '';
	},
	writeFile:function(path, data){
		try {
			var fs = require('fs');
			fs.writeFileSync(path, data);
		} catch (e){

			if (e.message.indexOf("not permitted") > -1){
				Util.errorData.flag = true;
				Util.errorData.msg = "A permission error occured writing the item sets. Running the program as administrator may fix this. The program will now close.";
				alert(Util.errorData.msg);
				window.close();
			}

			console.log("Error writing file [" + path + "]");
		}
	},
	readFile:function(path){
		try {
			var fs = require('fs');
			return fs.readFileSync(path, 'utf8');
		} catch (e){
			console.log("Error reading file [" + path + "]");
		}
	},
	folderExists:function(path){
		var fs = require('fs');
		try {
			var stats = fs.lstatSync(path);
			//console.log(stats)
			if (stats.isDirectory()) {
				return true;
			}
		} catch (e){
			return false;
		}
	},
	rmdir:function(path){
		try{
			var fs = require('fs');
			if (fs.existsSync(path)){
				fs.readdirSync(path).forEach(function(file, index){
					var curPath = path + "/" + file;
					if (fs.lstatSync(curPath).isDirectory()){ //recurse
						Util.rmdir(curPath);
					} else { // delete file
						fs.unlinkSync(curPath);
					}
				});
				fs.rmdirSync(path);
			}
		} catch(e){
			if (e.message.indexOf("not permitted") > -1){
				Util.errorData.flag = true;
				Util.errorData.msg = "A permission error occured removing the old item sets. Running the program as administrator may fix this. The program can safely continue.";
			}
		}
	},
	mkdir:function(path, root){
		var fs = require('fs');
		var dirs = path.split('/'), dir = dirs.shift(), root = (root || '') + dir + '/';

		try { fs.mkdirSync(root); }
		catch (e) {
			if (e.message.indexOf("not permitted") > -1){
				Util.errorData.flag = true;
				Util.errorData.msg = "A permission error occured writing the item sets. Running the program as administrator may fix this. The program will now close.";
				alert(Util.errorData.msg);
				window.close();
			}

			//dir wasn't made, something went wrong
			if(!fs.statSync(root).isDirectory()) throw new Error(e);
		}

		return !dirs.length||Util.mkdir(dirs.join('/'), root);
	},
	log:function(data, color){
		var ele = document.getElementById("output");
		ele.innerHTML += '<font color="' + color + '">' + data + "</font><br>";
		ele.scrollTop = ele.scrollHeight;
	},
	betterDate:function(){
		var months= ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth();
		var day = today.getDate();
		day = (day < 10) ? "0" + day : day;
		
		var date = day + " " + months[month] + " " + year;
		return 	date;
	},
	openURL:function(url){
		window.open(url);
	},
	fileExist:function(filename){
		var fs = require('fs');
		return fs.existsSync(filename);
	},
	getFile:function(uri, filename, callback){
		var protocol = uri.split(':')[0];
		
		var req = require(protocol);
		var fs = require('fs');

		var path = require('path');
		var dir = path.parse(filename).dir;
		if (!Util.folderExists(dir)){
			Util.mkdir(dir);
		}

		if (!Util.fileExist(filename)){
			var file = fs.createWriteStream(filename);
			var request = req.get(uri, function(response) {
				response.pipe(file);
				setTimeout(callback, 500);
			});	
		} else {
			callback();
		}
	},
	maximizeWindow:function(){
		var gui = require('nw.gui');
		var win = gui.Window.get();
		win.maximize();
	},
	changeWinHeight:function(height){
		var gui = require('nw.gui');
		var win = gui.Window.get();	
		win.height = height;
	},
	changeWinWidth:function(width){
		var gui = require('nw.gui');
		var win = gui.Window.get();	
		win.width = width;
	},
	searchObjArray:function(myArray, keyName, val){
		for (var i = 0; i < myArray.length; i++) {
			if (myArray[i][keyName] === val) {
				return i;
			}
		}

		return -1;
	}
};
