import styles from '../styles/Login.module.scss';
import Head from 'next/head';
import { getProviders, getSession, signIn } from 'next-auth/react';

export default function Login({ providers }) {
  return (
    <>
      <Head>
        <title>Login | Next Notes</title>
        <meta name="description" content="Next Next Login page " />
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          <h2 className={styles.main__heading}>Login With:</h2>
          <ul className={styles.main__buttons}>
            {providers.map((provider, i) => (
              <li key={provider.id}>
                <button
                  className={`${styles.main__buttons__button} ${
                    i % 2 !== 0
                      ? styles['main__buttons__button--outlined']
                      : null
                  }`}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                >
                  {provider.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });
  if (session) return { redirect: { destination: '/' } };

  const providers = await getProviders({ req });

  return { props: { providers: Object.values(providers) } };
}
