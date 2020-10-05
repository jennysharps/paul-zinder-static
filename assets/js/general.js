// TODO: Remove & update styles for films page to use flex
jQuery(document).ready(function($) {
    //expand container to fit all right-foated content
    var container = $(".video-details-container").height(),
    right = ( $("#right-video-details").height()-1 );
    
    if ( container < right ) {
        $(".video-details-container").css( "height", right+"px" );	
    }
    
    var awards_container = ( $(".video-awards-container").height() -40 ),
    awards_right = $("#awards").height();
    
    if ($('#awards').hasClass('both')) {
        $("#awards").addClass("screenings-awards");
        if ( awards_container > awards_right ) {
            $("#awards").css( "height", awards_container+"px" );
        }
    }	 	
});
    
jQuery(window).load(function(){
    jQuery('img.gallery-img').each(function(i) {
        img = new Image();
        img.src = jQuery(this).parent().attr('href');
    });
});
