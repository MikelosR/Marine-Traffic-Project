import styles from "./SearchBar.module.css"

const SearchBar = ({ value, onChange }) => {
    return (
        <div className={styles.inputContainer}>
            <input className={styles.searchInput} type="text" name="search" id="search" placeholder="Search..." value={value} onChange={onChange} />
            <button className={styles.searchButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="white" fillRule="evenodd" d="m16.325 14.899l5.38 5.38a1.008 1.008 0 0 1-1.427 1.426l-5.38-5.38a8 8 0 1 1 1.426-1.426M10 16a6 6 0 1 0 0-12a6 6 0 0 0 0 12" /></svg>
            </button>
        </div>
    )
}

export default SearchBar;
