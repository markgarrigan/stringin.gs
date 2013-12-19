jQuery.fn.order = function(asc, fn) {
    fn = fn || function (el) {
        return $(el).text().replace(/^\s+|\s+$/g, '');
    };
    var T = asc !== false ? 1 : -1,
        F = asc !== false ? -1 : 1;
    this.sort(function (a, b) {
        a = fn(a), b = fn(b);
        if (a == b) return 0;
        return a < b ? F : T;
    });
    this.each(function (i) {
        this.parentNode.appendChild(this);
    });
};