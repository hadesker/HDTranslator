(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('surface') !== 'sidebar') {
        return;
    }
    document.documentElement.classList.add('sidebar-mode');
    document.addEventListener('DOMContentLoaded', function () {
        document.body && document.body.classList.add('sidebar-mode');
    });
})();
