import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const numbersToShow = new Set();

        numbersToShow.add(1);
        numbersToShow.add(totalPages);

        numbersToShow.add(page);

        if (page > 1) numbersToShow.add(page - 1);

        if (page < totalPages) numbersToShow.add(page + 1);

        const sortedPages = Array.from(numbersToShow).sort((a, b) => a - b);
        return sortedPages.reduce((acc, curr, idx, arr) => {
            if (idx > 0 && curr - arr[idx - 1] > 1) {
                acc.push('dots');
            }
            acc.push(curr);
            return acc;
        }, []).map((item, index) =>
            item === 'dots' ? (
                <span key={`dots-${index}`} className={styles.dots}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 18">
                        <path fill="none" stroke="var(--very-dark-blue)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0" />
                    </svg>
                </span>
            ) : (
                <button
                    key={item}
                    className={`${styles.pageButton} ${page === item ? styles.activePageButton : ""}`}
                    onClick={() => onPageChange(item)}
                >
                    <p>{item}</p>
                </button>
            )
        );
    };


    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.paginationPrev} ${page === 1 ? styles.disabledPagination : ""}`}
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="var(--very-dark-blue)" d="M12.727 3.687a1 1 0 1 0-1.454-1.374l-8.5 9a1 1 0 0 0 0 1.374l8.5 9.001a1 1 0 1 0 1.454-1.373L4.875 12z" />
                </svg>
                <p>Previous</p>
            </button>

            <div className={styles.paginationNumbers}>
                {renderPageNumbers()}
            </div>

            <button
                className={`${styles.paginationNext} ${page === totalPages ? styles.disabledPagination : ""}`}
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                <p>Next</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="var(--very-dark-blue)" d="M12.727 3.687a1 1 0 1 0-1.454-1.374l-8.5 9a1 1 0 0 0 0 1.374l8.5 9.001a1 1 0 1 0 1.454-1.373L4.875 12z" />
                </svg>
            </button>
        </div>
    );
};

export default Pagination;
