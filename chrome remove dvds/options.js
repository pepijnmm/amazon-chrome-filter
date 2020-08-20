document.addEventListener("DOMContentLoaded", function() {
// Saves options to chrome.storage
function save_options() {
  var choose = document.getElementById('choose').value;
  var nexttab = document.getElementById('nexttab').checked;
  var removeextra = document.getElementById('removeextra').checked;
  var keyboard = document.getElementById('keyboard').checked;
  var nextbutton = document.getElementById('nextbutton').checked;
  var disable = document.getElementById('disable').checked;
  chrome.storage.sync.set({
    chosen_filter: choose,
	next_tab: nexttab,
	removeextra: removeextra,
	keyboard: keyboard,
	nextbutton: nextbutton,
	disable: disable,
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}
function restore_options() {
  chrome.storage.sync.get({
    chosen_filter: 'red',
    next_tab: false,
    removeextra: true,
    keyboard: false,
    nextbutton: false,
    disable: false,
  }, function(items) {
    document.getElementById('choose').value = items.chosen_filter;
    document.getElementById('nexttab').checked = items.next_tab;
    document.getElementById('removeextra').checked = items.removeextra;
    document.getElementById('keyboard').checked = items.keyboard;
    document.getElementById('nextbutton').checked = items.nextbutton;
    document.getElementById('disable').checked = items.disable;
  });
}
document.getElementById('save').addEventListener('click', save_options);
restore_options();
});