
function switchTheme() {
    var theme = 'dark';
    if (document.documentElement.getAttribute('data-theme') == 'dark') {
        theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acrl-theme', theme);
}

const currentTheme = localStorage.getItem('acrl-theme') ? localStorage.getItem('acrl-theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}
