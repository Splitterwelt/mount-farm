let l10n = {
    'gwibers': 'Gwiber',
    'horses': 'Pferde',
    'kamuys': 'Kamuys',
    'lanners': 'Lanner',
    'lynxes': 'Luchse',
    'raids': 'Raids',
    'unhide-players': 'Alle',
};

function main() {
    printMounts();
    printPlayers();
    printMenu();
    restoreConfig();
    restoreUnselectedPlayers();
    updateSelectionCount();
    fetchAll();
}

function printMounts() {
    let content = document.querySelector('#content');

    Object.entries(mounts).forEach(([category, mounts]) => {
        let currentCategory = createCategory(category);
        addMenuItem(category).addEventListener('click', toggleSelectedItems);

        Object.entries(mounts).forEach(([mount, data]) => {
            let currentMount = createMount(mount, data);
            currentCategory.appendChild(currentMount);
        });

        content.appendChild(currentCategory);
    });
}

function printMenu() {
    addConfigMenuItem('player-selection').addEventListener('click', togglePlayerVisibility);
    addConfigMenuItem('unhide-players').addEventListener('click', undoPlayerSelection);
}

function undoPlayerSelection() {
    unhideAllPlayers();
    removePlayersFromLocalStorage();
    let items = document.querySelectorAll('.unselected-player');

    Array.from(items).forEach(item => {
        item.classList.remove('unselected-player');

    });
    updateSelectionCount();
}

function removePlayersFromLocalStorage() {
    Array.from(players.map(a => a.name.replace(' ', ''))).forEach(player => {
        localStorage.removeItem(`unselect${player}`);
    });
}

function togglePlayerVisibility() {
    let selectedPlayers = updateSelectionCount();

    if (selectedPlayers === players.length || selectedPlayers === 0) {
        invertPlayersInactivity();
    }
    else if (localStorage.getItem('hiddenPlayers') === 'true') {
        unhideAllPlayers();
    }
    else {
        hideUnselectedPlayers();
    }
}

function hideUnselectedPlayers() {
    let items = document.querySelectorAll('.player');

    Array.from(items).forEach(item => {
        if (item.classList.contains('unselected-player')) {
            item.classList.add('hidden');
        }
        else if (item.classList.contains('hidden')) {
            item.classList.remove('hidden');
        }
    });

    localStorage.setItem('hiddenPlayers', true);
}

function unhideAllPlayers() {
    let items = document.querySelectorAll('.player.hidden');
    Array.from(items).forEach(item => {
        item.classList.remove('hidden');
    })

    localStorage.removeItem('hiddenPlayers');
}

function addConfigMenuItem(name) {
    let item = addMenuItem(name);
    item.classList.add('config');
    return item;
}

function addMenuItem(name) {
    let item = document.createElement('div');
    item.classList.add('menu-item');
    item.id = `${name}-menu`;
    item.textContent = (name in l10n) ? l10n[name] : name;
    document.querySelector('#menu').appendChild(item);

    return item;
}

function updateSelectionCount() {
    const selectedCount = document.querySelector('.players').querySelectorAll('.player:not(.unselected-player)').length;
    const max = players.length;
    const text = `Spieler: ${selectedCount}/${max}`;
    document.querySelector('#player-selection-menu').textContent = text;

    return selectedCount;
}

function createCategory(name) {
    let category = document.createElement('div');
    category.classList.add('category');
    category.id = name;

    return category;
}

function toggleSelectedItems() {
    toggleItem(this.id);
}

function toggleItem(id) {
    let menuItem = document.getElementById(id);
    let category = document.getElementById(id.replace('-menu', ''));
    menuItem.classList.toggle('unselected');
    category.classList.toggle('hidden');
    if (menuItem.classList.contains('unselected')) {
        localStorage.setItem(id, true);
    }
    else {
        localStorage.removeItem(id);
    }
}

function invertPlayersInactivity() {
    let elements = document.querySelectorAll('.player');

    Array.from(elements).forEach(element => {
        element.classList.toggle('unselected-player');
    });
    players.forEach(player => {
        let element = document.querySelector(`[id^="${player.name.replace(' ', '')}"]`);
        toggleStoragePlayerSelection(element.id);
    })
    updateSelectionCount();
}

function playerClickHandler(event_) {
    if (event_.ctrlKey) {
        players.forEach(player => {
            if (player.name === event_.explicitOriginalTarget.textContent) {
                url = `https://de.finalfantasyxiv.com/lodestone/character/${player.id}/`;
                window.open(url, player.name, 'noopener');
            }
        })
    }
    else {
        togglePlayersInactivity(event_.explicitOriginalTarget);
    }
}

function togglePlayersInactivity(event_) {
    let elements = document.querySelectorAll(`[id^="${event_.id.split('-')[0]}"]`);
    Array.from(elements).forEach(element => {
        element.classList.toggle('unselected-player');
    });
    toggleStoragePlayerSelection(elements[0].id);
    updateSelectionCount();
}

function toggleStoragePlayerSelection(id) {
    let storageItem = `unselect${id.split('-')[0]}`;

    if (localStorage.getItem(storageItem) === 'true') {
        localStorage.removeItem(storageItem);
    }
    else {
        localStorage.setItem(storageItem, true);
    }
}

function togglePlayer() {
    let character = this.id.split('-')[0];
    let elements = document.querySelectorAll(`[id^="${character}"]`);

    Array.from(elements).forEach(element => {
        element.classList.toggle('hidden');
        if (element.classList.contains('hidden')) {
            localStorage.setItem(`hide${character}`, true);
        }
        else {
            localStorage.removeItem(`hide${character}`);
        }
    })
}

function restoreConfig() {
    let items = document.querySelectorAll('.menu-item');

    Array.from(items).forEach(item => {
        if (localStorage.getItem(item.id) === 'true') {
            toggleItem(item.id);
        }
    });
}

function restoreUnselectedPlayers() {
    let items = document.querySelectorAll('.player');

    Array.from(items).forEach(item => {
        const storageItem = `unselect${item.id.split('-')[0]}`;
        if (localStorage.getItem(storageItem) === 'true') {
            item.classList.add('unselected-player');
        }
    });
    if (localStorage.getItem('hiddenPlayers') === 'true') {
        hideUnselectedPlayers();
    }
}

function createMount(name, data) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('data');

    let iconElement = document.createElement('div');
    iconElement.classList.add('icon');
    let imageElement = document.createElement('img');
    imageElement.setAttribute('src', data.icon);
    iconElement.appendChild(imageElement);

    let nameElement = document.createElement('div');
    nameElement.classList.add('name');
    nameElement.textContent = data.name;

    let sourceElement = document.createElement('div');
    sourceElement.classList.add('source');
    sourceElement.textContent = data.source;

    let infoElement = document.createElement('div');
    infoElement.classList.add('info');
    infoElement.appendChild(nameElement);
    infoElement.appendChild(sourceElement);

    let headElement = document.createElement('div');
    headElement.classList.add('head');
    headElement.appendChild(iconElement);
    headElement.appendChild(infoElement);
    dataElement.appendChild(headElement);

    let mountElement = document.createElement('div');
    mountElement.classList.add('mount');
    mountElement.id = name;
    mountElement.appendChild(dataElement);

    return mountElement;
}

function printPlayers() {
    let mounts = document.getElementsByClassName('mount');
    Array.from(mounts).forEach(mount => {
        playersElement = document.createElement('div');
        playersElement.classList.add('players');
        players.sort(sortPlayersByName).forEach(player => {
            playerElement = document.createElement('p');
            playerElement.id = `${player.name}-${mount.id}`.replaceAll(' ', '');
            playerElement.classList.add('player', 'owned-unknown')
            playerElement.textContent = player.name;
            playerElement.addEventListener('click', playerClickHandler);
            let character = player.name.replace(' ', '');
            if (localStorage.getItem(`hide${character}`)) {
                playerElement.classList.toggle('hidden');
            }
            playersElement.appendChild(playerElement);
        });
        mount.appendChild(playersElement);
    });
}

function sortPlayersByName(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

function fetchAll() {
    let mountList = Array.prototype.concat.apply([], Object.values(mounts).map(a => Object.keys(a)));
    players.forEach(player => {
        fetch(`https://xivapi.com/character/${player.id}?data=MIMO&columns=Mounts`, {mode: 'cors'})
            .then(response => response.json())
            .then(data => {

                let ownedMounts = data.Mounts.map(a => a.Name);
                mountList.forEach(mount => {
                    if (ownedMounts.includes(mount)) {
                        markOwnership(player.name, mount, true);
                    }
                    else {
                        markOwnership(player.name, mount, false);
                    }
                });
                player.updated = true;
            });
    });
}

function markOwnership(player, mount, owned) {
    let playerElement = document.getElementById(mount).querySelector(`#${player}-${mount}`.replaceAll(' ', ''));
    playerElement.classList.remove('owned-unknown');

    if (owned === true) {
        playerElement.classList.add('owned-true');
    }
    else {
        playerElement.classList.add('owned-false');
    }
}

main();
