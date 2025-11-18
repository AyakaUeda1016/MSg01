const passwordInput = document.getElementById('passwordInput');
const passwordToggle = document.getElementById('passwordToggle');
let isPasswordVisible = false;

// 戻るボタンのクリックイベント
document.querySelector('.back-button').addEventListener('click', function() {
    console.log('戻るボタンがクリックされました');
    window.history.back();
});

if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function(e) {
        e.preventDefault();
        isPasswordVisible = !isPasswordVisible;
        
        if (isPasswordVisible) {
            passwordInput.type = 'text';
            this.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            this.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
}
