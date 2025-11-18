document.addEventListener('DOMContentLoaded', function() {
    const birthdateInput = document.getElementById('birthdate');
    let isProcessing = false;
    
    birthdateInput.addEventListener('input', function(e) {
        if (isProcessing) return;
        isProcessing = true;
        
        let value = e.target.value;
        
        value = value.replace(/[０-９\u3000-\u3099]/g, '');
        
        let digitsOnly = value.replace(/\D/g, '');
        
        if (digitsOnly.length > 8) {
            digitsOnly = digitsOnly.slice(0, 8);
        }
        
        let formattedValue = '';
        if (digitsOnly.length > 0) {
            formattedValue = digitsOnly.slice(0, 4);
        }
        if (digitsOnly.length >= 5) {
            formattedValue += '/' + digitsOnly.slice(4, 6);
        }
        if (digitsOnly.length >= 7) {
            formattedValue += '/' + digitsOnly.slice(6, 8);
        }
        
        e.target.value = formattedValue;
        isProcessing = false;
    });

    birthdateInput.addEventListener('compositionend', function(e) {
        isProcessing = false;
    });

    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');
    const eyeOpen = togglePasswordBtn.querySelector('.eye-open');

    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isPasswordVisible = passwordInput.type === 'text';
        
        if (isPasswordVisible) {
            passwordInput.type = 'password';
            eyeClosed.style.display = 'block';
            eyeOpen.style.display = 'none';
        } else {
            passwordInput.type = 'text';
            eyeClosed.style.display = 'none';
            eyeOpen.style.display = 'block';
        }
    });
});
