import Head from 'next/head';
import styles from './styles.module.scss'

export default function Posts() {
    return(
        <>
        <Head>
            <title>Posts | Ignews</title>
        </Head>

        <main className={styles.container}>
            <div className={styles.posts}>
                <a>
                    <time></time>
                    <strong></strong>
                    <p></p>
                </a>
            </div>
        </main>

        </>

      
    );

}