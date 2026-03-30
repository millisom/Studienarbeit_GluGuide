import CreatePost from "../components/CreatePost";
import React from "react";
import styles from '../styles/Blog.module.css';
import ViewBlogEntries from "../components/ViewBlogEntries";
import { useTranslation } from "react-i18next";

const Blogs = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.blogs}>
            <h1 className={styles.pageTitle}>{t('blogs.pageTitle')}</h1>
            <div className={styles.section}>
                <CreatePost />
            </div>
            <div className={styles.section}>
                <ViewBlogEntries />
            </div>
        </div>
    );
};

export default Blogs;