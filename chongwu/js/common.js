;(function() {
    document.getElementById('hamburger')?.addEventListener('click', function() {
        document.querySelector('.header')?.classList.toggle('hamburger-active');
    });
})();