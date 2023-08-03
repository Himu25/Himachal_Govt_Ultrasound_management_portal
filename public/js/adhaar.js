$('[data-type="adhaar-number"]').keyup(function () {
  var value = $(this).val();
  value = value.replace(/\D/g, "").split(/(?:([\d]{4}))/g).filter(s => s.length > 0).join(" ");
  $(this).val(value);
});
  $('#myForm').on('submit', function(event) {
    var aadharInput = $('#aadharinput');
    var value = aadharInput.val().replace(/\s/g, ''); // Remove spaces from the input
  
    if (value.length !== 12) {
      aadharInput.addClass('invalid');
      event.preventDefault();
      vibrateInput(aadharInput);
      aadharInput.next('.error-message').text('Invalid Aadhar').show();
      aadharInput.parent('.input-box').css('margin-bottom', '-8px');
    } else {
      aadharInput.removeClass('invalid');
      aadharInput.next('.error-message').hide();
      aadharInput.parent('.input-box').css('margin-bottom', '');
    }
  });
  
  function vibrateInput(input) {
    if (navigator.vibrate) {
      input.addClass('vibrate');
      navigator.vibrate(200); // Vibrate for 200 milliseconds
      setTimeout(function() {
        input.removeClass('vibrate');
      }, 200);
    }
  }
  $('#aadharinput').keyup(function () {
    var aadharInput = $(this);
    aadharInput.removeClass('invalid');
    aadharInput.next('.error-message').hide();
    aadharInput.parent('.input-box').css('margin-bottom', '');
  });