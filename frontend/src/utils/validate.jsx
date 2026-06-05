
// Proper Regex for ensuring all credentials abide by our standards
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return(!(re.test(String(email).toLowerCase())));
}

export const validateUsername = (username) => {
    const re = /^[A-Za-zÀ-ÿ1-9_]{4,16}$/;
    return(!(re.test(String(username))));
}

export const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%&?])([\w@$!%&?]){8,}$/;
    return(!(re.test(String(password))));
}

// Displays different errors depending on which rules have been broken.
export function PwError_Display({ password }) {
    console.log('feafe')
    const re_lowercase = /(?=.*[a-z])/;
    const re_uppercase = /(?=.*[A-Z])/;
    const re_digit = /(?=.*\d)/;
    const re_special = /(?=.*[@$!%&?])/;
    const re_8 = /^.{8,}$/;

    return (
        <div>
            { !(re_uppercase.test(String(password))) && <p className="error ">Password must include an uppercase letter.</p> }
            { !(re_lowercase.test(String(password))) && <p className="error ">Password must include a lowercase letter.</p> }
            { !(re_digit.test(String(password))) && <p className="error ">Password must include a digit.</p> }
            { !(re_special.test(String(password))) && <p className="error ">Password must include a special character from '@$!%&?'.</p> }
            { !(re_8.test(String(password))) && <p className="error ">Password must be at least 8 characters.</p> }
        </div>
    )
}
