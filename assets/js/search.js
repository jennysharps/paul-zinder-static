jQuery(document).ready(function($) {
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
    
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
    
            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
    }

    var idx = lunr(function () {
        this.field('id');
        this.field('title', { boost: 10 });
        this.field('description');
        this.field('alt', { boost: 9 });
        this.field('content');
        
        for (var key in window.store) {
            this.add({
                id: key,
                title: window.store[key].title,
                description: window.store[key].description,
                alt: window.store[key].alt,
                content: window.store[key].content
            });
        }
    });

    $('#search-input').bind('keyup', function(event) {
        var searchInput = $(this);
        var query = searchInput.val();
        var resultsEl = $('#live-search-results');
        if (query.length === 0) {
            resultsEl.html("");
        }

        if (event.keyCode !== 9 && query.length > 2) {
            var matches = idx.search(query + "* " + query + "~1")
                .map(function(m) { return window.store[m.ref]; })
                .filter(function(m) { return m.title });

            if (matches.length) {
                var itemsHtml = "";
                matches.forEach(function(item) {
                    itemsHtml += `<li class="live-search-result"><a href="${item.url}"><h5>${item.title}</h5></a></li>`;
                });
                resultsEl.html(itemsHtml);
            } else {
                resultsEl.html(`<li class="live-search-result none">No results found for <em class="input-value">${query}</em>.</li>`);
            }

            Popper.createPopper(resultsEl.parent()[0], resultsEl[0], {
                placement: "top",
                modifiers: [{
                    name: 'offset',
                    options: { offset: [5, 5] }
                }]
            });
        }
    });


    var searchTerm = getQueryVariable('s') || "";
    var searchResultsEl = $('#search-results');
    var noResultsHtml = `<div class="search-result none"><h2>No Results</a></h2>`;
    $('.search-term').html(`"${searchTerm}"`);

    if (searchTerm) {
        var matches = idx.search(searchTerm + "* " + searchTerm + "~1")
            .map(function(m) { return window.store[m.ref]; })
            .filter(function(m) { return m.title });
        
        if (matches.length) {
            var itemsHtml = "";
            matches.forEach(function(item) {
                itemsHtml += `<div class="search-result"><h2><a href="${item.url}">${item.title}</a></h2><p>${item.description}</p></div>`;
            });
            searchResultsEl.html(itemsHtml);
        } else {
            searchResultsEl.html(noResultsHtml);
        }
    } else {
        searchResultsEl.html(noResultsHtml);
    }
});
