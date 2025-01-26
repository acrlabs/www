
function switchTheme() {
    var theme = 'default';
    if (document.documentElement.getAttribute('data-theme') == 'default') {
        theme = 'alternate';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acrl-theme', theme);
}

const currentTheme = localStorage.getItem('acrl-theme') ? localStorage.getItem('acrl-theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

const openMenuClass = 'open-menu-item';

function toggleSidebarItem(item_id) {
    var subMenu = document.getElementById(item_id).nextElementSibling;
    if (subMenu.classList.contains(openMenuClass)) {
        subMenu.style.maxHeight = null;
        subMenu.classList.remove(openMenuClass);
    } else {
        var otherOpenMenus = document.getElementsByClassName(openMenuClass);
        for (var i = 0; i < otherOpenMenus.length; i++) {
            // Need to set display: none first, because getElementsByClassName is a live
            // method, so as soon as we remove the class name, the list is invalid
            //
            // This _could_ cause problems if we ever get into a state where there is
            // more than one open menu, but by design that's not the case here.
            otherOpenMenus[i].style.maxHeight = null;
            otherOpenMenus[i].classList.remove(openMenuClass);
        }

        subMenu.classList.add(openMenuClass);
        subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
    }
}
