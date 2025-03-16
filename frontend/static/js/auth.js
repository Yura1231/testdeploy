document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
   

    if (accessToken) {
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('profile-btn').style.display = 'inline-block';
        
        
    }

    
});

document.getElementById('logout-btn').addEventListener('click', function () {
    
    event.preventDefault();
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    location.reload();

    
    
});

document.getElementById('profile-btn').addEventListener('click', function() {
    window.location.href = 'profile.html';
});