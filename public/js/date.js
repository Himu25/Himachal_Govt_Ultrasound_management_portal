var today = new Date();
    var currentYear = today.getFullYear();
    var currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    var currentDay = today.getDate().toString().padStart(2, '0');

    // Set the maximum date for the input field
    var dobInput = document.getElementById('dob');
    dobInput.max = currentYear + '-' + currentMonth + '-' + currentDay;