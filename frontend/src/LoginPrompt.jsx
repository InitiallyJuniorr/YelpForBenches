import { useNavigate } from 'react-router-dom';

export default function LoginPrompt({ open, onClose }) {
    const navigate = useNavigate();
    
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                background: 'white', padding: '32px', borderRadius: '12px',
                textAlign: 'center', maxWidth: '300px',
                position: 'relative', zIndex: 10000
            }} onClick={e => e.stopPropagation()}>
                <h2>Hold up!</h2>
                <p>You need to be logged in to do this.</p>
                <button onClick={() => navigate('/')}>Log In</button>
                <button onClick={onClose} style={{marginLeft: '10px'}}>Maybe Later</button>
            </div>
        </div>
    );
}