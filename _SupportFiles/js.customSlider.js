var select = $( "#budget" );
var time = $( "#time" );

$('.sliders-cont').show();

var budgetSlider = $('#budget-slider').slider({
      min: 1,
      max: 5,
      range: "min",
      value: select[ 0 ].selectedIndex + 1,
      slide: function( event, ui ) {
        select[ 0 ].selectedIndex = ui.value - 1;
        $('.budget-amount').text('$'+ select.val());
      }
    });

var timeSlider = $('#time-slider').slider({
      min: 1,
      max: 5,
      range: "min",
      value: time[ 0 ].selectedIndex + 1,
      slide: function( event, ui ) {
        time[ 0 ].selectedIndex = ui.value - 1;
        $('.time-amount').text(time.val());
      }
    });

$( "#budget, #time" ).hide();

$('#budget-slider .ui-slider-handle').prepend('<div class="budget-amount">$'+select.val()+'</div>');

$('#time-slider .ui-slider-handle').prepend('<div class="time-amount">'+time.val()+'</div>');