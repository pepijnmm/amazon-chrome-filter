var disable;
var next_tab;
var removeextra;
var chosen_filter;
var previous_not_empty_page;
var previousurl;
var keyboard;
var nextbutton;
var phone = false;
var phonetwo = false;
var computer = false;
//load config
chrome.storage.sync.get({
    chosen_filter: 'red',
	previousurl: "",
	previous_not_empty_page: [],
    next_tab: false,
    removeextra: true,
    disable: false,
	nextbutton:false,
	keyboard: false,
		}, function(items) {
			disable = items.disable;
			previous_not_empty_page = items.previous_not_empty_page;
			previousurl = items.previousurl;
			keyboard = items.keyboard;
			nextbutton = items.nextbutton;
			next_tab = items.next_tab;
			removeextra = items.removeextra;
			chosen_filter = items.chosen_filter;
			
			start();
		}
		);
function start(){
		//check if amazon film page is phone or computer
		if(document.head.querySelector("[name~=description][content]") && document.head.querySelector("[name~=description][content]").content.includes("Films") &&
		(document.querySelectorAll("#sx-top-filter-button").length==1) || document.querySelectorAll("#s-all-filters").length==1){
			phone = true;
		}
		else if((document.querySelector(".a-unordered-list .a-color-base.a-text-bold") &&
			(document.querySelector(".a-unordered-list .a-color-base.a-text-bold").innerHTML.toLowerCase().includes("films") ||
			document.querySelector(".a-unordered-list .a-color-base.a-text-bold").innerHTML.toLowerCase().includes("tv")))
			&&
			(document.querySelectorAll("#s-result-sort-select").length==1)
		){
			computer = true;
		}
		//if phone start removing and checkurl for next and previous
		if(!disable&&(phone||computer)
		
		){
			document.querySelector(".a-pagination").addEventListener("click", function(){
				setTimeout(function(){start();},1000);
			});
			checksameurl();
			removedvdetc();
		}
}
//get previous pages
function checksameurl(){
	if(previousurl == null || document.querySelector(".a-last").parentElement.childNodes[0].childNodes[0].href == null){
		chrome.storage.sync.set({
			previousurl: window.location.href,
			previous_not_empty_page: []
		});
		previous_not_empty_page = [];
		previousurl = window.location.href;
		return;
	}
	//check if previous page is the same as button pervious(page number is not checked)
	const paramtersnow = geturlparams(document.querySelector(".a-last").parentElement.childNodes[0].childNodes[0].href);
	if (paramtersnow["i"]==previousurl["i"] &&
	paramtersnow["bbn"]==previousurl["bbn"] &&
	paramtersnow["rh"]==previousurl["rh"] &&
	//paramtersnow["page"]==previousurl["page"] &&
	paramtersnow["s"]==previousurl["s"]){
			chrome.storage.sync.set({
				previousurl: window.location.href
			});
	}
}
//checks for remove dvdetc
function removedvdetc(){
	if(keyboard){
		//on arrow right go next on arrow left go back
		window.onkeydown = function (e) {

			e = e || window.event;
			if(e.code == "ArrowRight"){
				nextPage();
			}
			else if(e.code == "ArrowLeft"){
				if(previous_not_empty_page.length>1){
					previous_not_empty_page.pop()
					const pop = previous_not_empty_page.pop();
					chrome.storage.sync.set({
						previousurl: pop,
						previous_not_empty_page: previous_not_empty_page
					});
					gotopage(pop);
				}
			}
		};

	}
	if(nextbutton){
		//add next button in the middle of the screen
		var topbottom = {top:"0",left:"0"};
		if(computer){
			topbottom = {top:"100px",left:"800px"};
		}
		else if(phone){
			topbottom = {top:"140px",left:"10px"};
		}
		document.querySelector(".a-last").innerHTML += "<div style='position:absolute; z-index: 208;'><button onclick='window.location.href=\""+document.querySelector(".a-last").childNodes[0].href+"\"' style='position:fixed; left:"+topbottom.left+"; top:"+topbottom.top+"; z-index: 1; background: linear-gradient(to bottom,#f7f8fa,#e7e9ec); border: .1rem solid #6c6e73; border-color: #adb1b8 #a2a6ac #8d9096; padding:12px;' id='addedbuttonphone'>Volgende<span class='a-letter-space'></span><span class='a-letter-space'></span>→</button></div>"
	}
	var movies =[];
	//get movies(problemen met next page en infinite scroll trigerd script niet)
	if(phone){
		movies = document.querySelectorAll(".sx-table-detail .a-row.a-spacing-micro.a-spacing-top-micro .a-color-base");
		//diffrent kind of movie list
		if(movies.length==0){
			phonetwo = true
			movies = document.querySelectorAll(".a-link-normal .a-section.a-spacing-mini.a-spacing-top-small .a-color-base .a-color-base");
		}
	}
	//get movies
	else if(computer){
		movies = document.querySelectorAll(".s-result-list.s-search-results.sg-row .s-result-item.s-asin");
	}
	//count how mutch movies are not blu-ray
	var count = 0;
	//foreach movie check if dvd etc. if removeextra is enabled also hide others
	movies.forEach((data)=>{
		let remove = false;
		//if computer one movie can have multiple formats. if first one is not bluray it will be deleted because else price is wrong
		if(computer){
			let hasnobluray = 0;
			let movietypes = data.querySelectorAll(".a-size-base.a-link-normal.a-text-bold");
			let type = movietypes[0]
			//movietypes.forEach((type)=>{
			dataname = type.innerHTML.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
			if(dataname && (dataname.includes("dvd")||dataname.includes("computergame")||dataname.includes("pc")||dataname.includes("bladmuziek")||dataname.includes("umd")||dataname.includes("vhs")||dataname.includes("cd")||dataname.includes("lp") ||(removeextra==true&&(dataname.includes("paperback")||dataname.includes("accessory")||dataname.includes("ander")||dataname.includes("accessoire")||dataname.includes("hardcover"))))){
				hasnobluray++;
				//type.parentElement.parentElement.remove();
			}
			//});
			if(hasnobluray>0){
				remove = true;
			}
		}
		if(!computer)dataname = data.innerHTML.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
		if((computer && remove) ||(!computer && dataname && (dataname.includes("dvd")||dataname.includes("computergame")||dataname.includes("pc")||dataname.includes("bladmuziek")||dataname.includes("umd")||dataname.includes("vhs")||dataname.includes("cd")||dataname.includes("lp") ||(removeextra==true&&(dataname.includes("paperback")||dataname.includes("accessory")||dataname.includes("ander")||dataname.includes("accessoire")||dataname.includes("hardcover")))))){
			let element;
			if(phonetwo)element = data.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
			else if(phone)element = data.parentElement.parentElement.parentElement.parentElement.parentElement;
			else if(computer)element = data;//.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
			//depending on option change color or remove them
			if(chosen_filter == 'red'){
				element.style.background = "#ff8181";
			}
			else{
				element.remove();
			}
			count++;
		}
		else{
		}
	});
	//if everything is not a blu-ray   else safe page in previous
	if(count == movies.length && next_tab == true && count>0){
		nextPage();
	}
	else{
		if(previous_not_empty_page.length>20){
			previous_not_empty_page.shift();
		}
		previous_not_empty_page.push(window.location.href);
		chrome.storage.sync.set({
			previous_not_empty_page: previous_not_empty_page
		});
	}
}
//click on button next page
function nextPage(){
	if(phone)document.getElementsByClassName("a-last")[0].outerHTML = document.getElementsByClassName("a-last")[0].outerHTML;
	if(document.querySelector(".a-disabled.a-last")==null){
		gotopage(document.getElementsByClassName("a-last")[0].childNodes[0].href);
		//document.getElementsByClassName("a-last")[0].childNodes[0].click();
	}
}
//go to given page
function gotopage(url){
	window.location.href = url;
}
//get parameters of given url
function geturlparams(url) {
    var vars = {};
    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}