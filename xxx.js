// Mengubah atribut [lang] pada tag html utama berdasarkan seleksi menu drop-down
document.getElementById('langSwitcher').addEventListener('change', function(e) {
    document.getElementById('rootNode').setAttribute('lang', e.target.value);
});
