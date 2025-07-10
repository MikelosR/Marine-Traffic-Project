import styles from './Footer.module.css'
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <nav className={styles.footerNavigation}>
                <Link to="/privacy-policy" className={styles.footerLink}><p>Privacy Policy</p></Link>
                <Link to="/about" className={styles.footerLink}><p>About</p></Link>
            </nav>

            <p className={styles.copyright}>© Copyright SeaX 2025</p>
        </footer>
    )
}