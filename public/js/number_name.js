$(document).ready(function() {
  $('[data-type="name"]').on('keypress', function(event) {
    var charCode = event.charCode;
    if (!(charCode >= 65 && charCode <= 90) && // A-Z
        !(charCode >= 97 && charCode <= 122) && // a-z
        !(charCode == 32) && // space
        !(charCode == 13)) { // Enter key
      event.preventDefault();
    }
  });

  $('[data-type="number"]').on('keypress', function(event) {
    var charCode = event.charCode;
    if (!(charCode >= 48 && charCode <= 57) && // 0-9
        !(charCode == 13)) { // Enter key
      event.preventDefault();
    }

    var maxLength = parseInt($(this).data('max-length')); // Get the maximum length from the data attribute
    if ($(this).val().length >= maxLength) {
      event.preventDefault();
    }
    
    var $numberInput = $(this);
    var inputBox = $numberInput.parent('.input-box');
    $numberInput.removeClass('invalid');
    $numberInput.next('.error-message').hide();
    inputBox.css('margin-bottom', originalMarginBottom);
  });
});

$('#myForm').on('submit', function(event) {
  var $numberInput = $('#numberInput');
  var inputBox = $numberInput.parent('.input-box');
  var pattern = new RegExp($numberInput.data('pattern')); // Get the pattern from the data attribute
  if (!pattern.test($numberInput.val())) {
    $numberInput.addClass('invalid');
    event.preventDefault();
    vibrateInput($numberInput);
    $numberInput.next('.error-message').text('Invalid Number').show();
    inputBox.css('margin-bottom', '-8px');
  } else {
    $numberInput.removeClass('invalid');
    $numberInput.next('.error-message').hide();
    inputBox.css('margin-bottom', originalMarginBottom);
  }
});

function vibrateInput($input) {
  if (navigator.vibrate) {
    $input.addClass('vibrate');
    navigator.vibrate(200); // Vibrate for 200 milliseconds
    setTimeout(function() {
      $input.removeClass('vibrate');
    }, 200);
  }
}
$('#numberInput').keyup(function () {
  var aadharInput = $(this);
  aadharInput.removeClass('invalid');
  aadharInput.next('.error-message').hide();
  aadharInput.parent('.input-box').css('margin-bottom', '');
});
