/**
 * Copyright 2012-present Thom Seddon.
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

var btn, list;

/**
 * Render list
 */

var render = function (accounts) {
  var parent = document.getElementById('accounts');

  Object.keys(accounts).forEach(function (uid) {
    var account = accounts[uid];
    var li = document.createElement('li');
    li.innerHTML = '<label>' +
      '<input type="checkbox" data-uid="' + uid + '" ' + (account.ignored ? '' : 'checked') + '>' +
      '<img src="' + account.img + '">' +
      '<div>' + account.name + '</div>' +
    '</label>';
    li = parent.appendChild(li);

    li.querySelector('input').addEventListener('change', function () {
      btn.disabled = false;
      btn.innerHTML = 'Save';
    });
  });

  btn.addEventListener('click', save, false);
  btn.disabled = true;
};

/**
 * Save state
 */

var save = function (event) {
  var ignore = [];

  var elems = document.querySelectorAll('input[type="checkbox"]');
  for (var i = 0, len = elems.length; i < len; i++) {
    var elem = elems[i];
    if (!elem.checked)
      ignore.push(elem.getAttribute('data-uid'));
  }

  chrome.extension.sendMessage({ type: 'ignore', ignore: ignore }, function() {
    btn.disabled = true;
    btn.innerHTML = 'Saved';
  });
};

document.addEventListener('DOMContentLoaded', function () {
  btn = document.getElementById('save');
  chrome.extension.sendMessage({ type: 'getAccounts' }, render);
});
