function printError(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}

//signup 
function signupValidate() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("conformPassword").value;
  const email = document.getElementById("email").value;
  const mobile = document.getElementById("mobile").value;

  let valid = true;

  // Name validation
  if (name == "") {
    printError("nameErr", "Please enter your name");
    valid = false;
  } else {
    const regex = /^[a-zA-Z\s]+$/;
    if (!regex.test(name)) {
      printError("nameErr", "Please enter a valid name");
      valid = false;
    } else {
      printError("nameErr", "");
    }
  }

  // Password validation
  if (password == "") {
    printError("passErr", "Please enter your password");
    valid = false;
  } else {
    printError("passErr", "");
  }

  // Confirm Password validation
  if (confirmPassword == "") {
    printError("conpasErr", "Please enter your password again");
    valid = false;
  } else if (password !== confirmPassword) {
    printError("conpasErr", "Passwords do not match");
    valid = false;
  } else {
    printError("conpasErr", "");
  }

  // Email validation
  if (email == "") {
    printError("emailErr", "Please enter your email address");
    valid = false;
  } else {
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(email)) {
      printError("emailErr", "Please enter a valid email address");
      valid = false;
    } else {
      printError("emailErr", "");
    }
  }

  // Mobile validation
  if (mobile == "") {
    printError("mobileErr", "Please enter your mobile number");
    valid = false;
  } else {
    const regex = /^[1-9]\d{9}$/;
    if (!regex.test(mobile)) {
      printError("mobileErr", "Please enter a valid 10 digit mobile number");
      valid = false;
    } else {
      printError("mobileErr", "");
    }
  }

  // Prevent form submission if any validation fails
  return valid;
}




//login
function printError(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}

function loginValidate() {
  console.log("login validate");
  let email = document.getElementById("lEmail").value;
  let password = document.getElementById("lPassword").value;
  let valid = true;

  // Email validation
  if (email == "") {
    printError("lEmailErr", "Please enter your email address");
    valid = false;
  } else {
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(email)) {
      printError("lEmailErr", "Please enter a valid email address");
      valid = false;
    } else {
      printError("lEmailErr", "");
    }
  }

  // Password validation
  if (password == "") {
    printError("lPassErr", "Please enter your password");
    valid = false;
  } else {
    printError("lPassErr", "");
  }

  return valid;
}
