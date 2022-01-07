/*!
* Start Bootstrap - Modern Business v5.0.4 (https://startbootstrap.com/template-overviews/modern-business)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-modern-business/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// var auth = `Bearer ` + localStorage.getItem("access_token");

function getTranslation(){
    let sentence = document.getElementById("plainData").value;
  
    fetch('https://8c8jirboi0.execute-api.eu-west-1.amazonaws.com/prod/', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
        // 'Authorization': auth
      }, 
      body: JSON.stringify({inputs: sentence})
    })
    .then((res) => res.json())
    .then((data) => {
        console.log("TRANSLATION")
        console.log(data);
        let info = `${data['message']}`;
    })
    .catch((err) => console.log(err)) 
  
}
