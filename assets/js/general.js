jQuery(window).load(function(){
    jQuery('img.gallery-img').each(function(i) {
        img = new Image();
        img.src = jQuery(this).parent().attr('href');
    });
});
