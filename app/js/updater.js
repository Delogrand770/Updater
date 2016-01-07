var UPDATER = {
	files: [],
	manifest: [],
	updateList: [],
	crypt: require('crypto'),
	fs: require('fs'),
	dive: require('./js/npm/dive.js'),
	path: require('path'),
	count: 0,
	ele: null,
	repo: null,
	updateURL: "",
	cb: null,
	ini:function(customtitle, updateURL, cb){
		document.title = customtitle + " Updater";
		document.getElementById('apptitle').innerHTML = customtitle + " Updater";
		UPDATER.count = 0;
		UPDATER.updateURL = updateURL;
		UPDATER.cb = cb;
		UPDATER.ele = document.getElementById('output');
		UPDATER.generateManifest(updateURL);
	},
	drawRequiredGUI:function(){

	},
	getUpdatedFiles:function(){
		for (var i = 0; i < UPDATER.updateList.length; i++){				
			var fileURI = UPDATER.updateURL + UPDATER.updateList[i].split('..\\')[1].replace(/\\/g,'/');
			Util.getFile(fileURI, UPDATER.updateList[i], function(){
				UPDATER.progressBar(3, UPDATER.updateList.length);

				if (UPDATER.count >= UPDATER.updateList.length){
					UPDATER.cb();
				}
			});
		}

		if (UPDATER.updateList.length == 0){
			UPDATER.cb();
		}
	},
	compareRepoToManifest:function(){
		for (var i = 0; i < UPDATER.repo.length; i++){
			var index = Util.searchObjArray(UPDATER.manifest, 'file', UPDATER.repo[i].file);
			if (index > -1){
				console.log('Found it', UPDATER.repo[i].file, UPDATER.manifest[index].file);
				if (UPDATER.repo[i].hash != UPDATER.manifest[index].hash){
					UPDATER.updateList.push(UPDATER.repo[i].file);
				}
			} else {
				UPDATER.updateList.push(UPDATER.repo[i].file);
			}
		}

		UPDATER.getUpdatedFiles();
		console.log(UPDATER.updateList);
	},
	getRepoManifest:function(updateURL){
		var updateURL = updateURL || "https://raw.githubusercontent.com/Gavin770/Updater/master/";
		var manifestURL = updateURL + "manifest.json";
		Util.getPage(manifestURL, function(data){
			UPDATER.repo = JSON.parse(data);
			//console.log(UPDATER.repo);
			UPDATER.compareRepoToManifest();
			//Sync Entry Point
		});
	},
	generateManifest:function(){
		UPDATER.dive("..\\", {all: true}, function(err, file, stat) {
			if (err){throw err};
			var path = require('path');
			UPDATER.files.push("..\\" + path.relative('..\\', file));
			UPDATER.progressBar(1, "??");
			//console.log();
		}, function(){
			UPDATER.progressBar(1, "MAX");
			setTimeout("UPDATER.progressBar(2, -1)", 500)
			setTimeout("UPDATER.checkSumManifest();", 1500);
		});
	},
	checkSumManifest:function(){
		for (var i = 0; i < UPDATER.files.length; i++){
			UPDATER.checksumFile({file: UPDATER.files[i], cb: function(err, data, params){
				UPDATER.manifest.push({file: params.file, hash: data});
				UPDATER.progressBar(2, UPDATER.files.length);

				if (UPDATER.count >= UPDATER.files.length){
					Util.writeFile('../manifest.json',JSON.stringify(UPDATER.manifest, null, '\t'));

					UPDATER.progressBar(2, "MAX");
					setTimeout("UPDATER.progressBar(3, -1)", 500)
					setTimeout("UPDATER.getRepoManifest();", 1500);
					//Sync Entry Point
				}
			}});
		}
	},
	// checksumString:function(str, algorithm, encoding){
	// 	var crypt = require('crypto');
	// 	return crypt
	// 		.createHash('md5')
	// 		.update(str, 'utf8')
	// 		.digest(encoding || 'hex');
	// },
	checksumFile:function(params){
		var crypt = UPDATER.crypt;
		var fs = UPDATER.fs;
		var hash = crypt.createHash(params.algorithm || "md5");
		var stream = fs.createReadStream(params.file);

		stream.on('data', function(data){
			hash.update(data, 'utf8');
		});

		stream.on('end', function(){
			var data = hash.digest(params.encoding || "hex");

			if (params.cb){
				params.cb(null, data, params);
			} else {
				console.log(data);
				return data;
			}
		});
	},
	progressBar:function(step, total){
		UPDATER.count++;
		var el = document.getElementById('steps');
		var el2 = document.getElementById('pbar');
		var msg = "";

		total = (total == "??") ? 100 : total;
		var percent = (UPDATER.count / total) * 100;
		percent = (percent > 100) ? 100 : percent;
		percent = (total == "MAX") ? 100 : percent;
		percent = (total == -1) ? 0 : percent;
		UPDATER.count = (total == -1) ? 0 : UPDATER.count;


		if (total != "MAX"){
			total = (total == -1) ? "counting" : total;
			if (step == 1){
				msg = "Step " + step + " of 3 - Checking local files [" + UPDATER.count + "]";
			} else if (step == 2){
				msg = "Step " + step + " of 3 - Checking local file integrity [" + UPDATER.count + "/" + total + "]";
			} else if (step == 3){
				msg = "Step " + step + " of 3 - Downloading files [" + UPDATER.count + "/" + total + "]";
			}
			el.innerHTML = msg;
		}

		el2.style.width = percent + "%";
	},
	loadMainApp:function(app, height, width, resizable){
		Util.changeWinHeight(height);
		Util.changeWinWidth(width);
		parent.location = app;
	}
};