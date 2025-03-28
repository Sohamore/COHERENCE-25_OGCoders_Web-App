let loginBtns = document.getElementsByClassName("login-btn");


Array.from(loginBtns).forEach((loginBtn) => {
    loginBtn.addEventListener("click", () => {
        window.location.href = "Dashboard.html"; 
    });
});


let map = tt.map({
            key: 'B7Y3JRmvidZS7cUakcGNiZf9GAsgLMeu', // Replace with a valid key
            container: 'map', 
            center: [72.8777, 19.0760], // Example: Mumbai coordinates
            zoom: 12
        });
