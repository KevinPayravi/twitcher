/**
 * Copyright 2013 Thom Seddon.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (!chrome.cookies) {
	chrome.cookies = chrome.experimental.cookies;
}

//Globals
var COOKIE_TOKEN = 'auth_token';
	COOKIE_ID = 'twid';

var Accounts = (function () {

	var accountStore = {},
		key;

	function Accounts (key) {
		key = key;
	}

	Accounts.prototype.get = function (uid) {
		return accountStore[uid];
	};

	Accounts.prototype.set = function (uid, data) {
		accountStore[uid] = data;
	};

	Accounts.prototype.remove = function (uid) {
		delete accountStore[uid];
	};

	Accounts.prototype.save = function (callback) {
		var save = {};
		save[key] = JSON.stringify(accountStore);
		chrome.storage.sync.set(save, function () {
			callback(accountStore);
		});
	};

	Accounts.prototype.getAll = function (callback) {
		chrome.storage.sync.get(key, function (rawAccounts) {
			if (rawAccounts.accounts && rawAccounts.accounts.length) {
				accountStore = JSON.parse(rawAccounts.accounts);
			}

			callback(accountStore);
		});
	};

	return Accounts;

})();

var accounts = new Accounts('accounts');

var currentAccount = {
	change: function (uid) {
		chrome.cookies.set({
			url: 'https://twitter.com',
			name: COOKIE_TOKEN,
			value: accounts.get(uid).token,
			domain: '.twitter.com',
			path: '/',
			secure: true,
			httpOnly: true
		});

		chrome.cookies.remove({
			url: 'https://twitter.com',
			name: COOKIE_ID
		});

		chrome.tabs.getSelected(null, function (tab) {
			chrome.tabs.reload(tab.id);
		});
	},

	save: function (user, callback) {
		//Get the token
		chrome.cookies.get({url: 'https://twitter.com', name: COOKIE_TOKEN}, function (cookie) {
			if (!cookie) return callback();

			accounts.set(user.uid, {
				name: user.name,
				img: user.img,
				token: cookie.value
			});
			accounts.save(callback);
		});
	}
};

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

	if (sender.id !== window.location.host) return; //Not from us

	switch (request.type) {
		case 'getAccounts':
			accounts.getAll(sendResponse);
			break;
		case 'removeAccount':
			accounts.remove(request.uid);
			accounts.save(function (accounts) {
				sendResponse(accounts);
			});
			break;
		case 'switchAccount':
			currentAccount.change(request.uid);
			break;
		case 'currentAccount':
			// Make sure we have go all accounts before saving
			accounts.getAll(function () {
				currentAccount.save(request.currentAccount, sendResponse);
			});
			break;
	}

	// Indicate response via callback
	return true;
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-17516578-20']);
_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();