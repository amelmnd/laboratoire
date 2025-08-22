import Link from 'next/link';
import Image from 'next/image';
import styles from './Custom404.module.css';

const Custom404 = () => {
  return (
    <div className={styles.container}>
      <h2>Oups, page introuvable !</h2>
      <p>La page que vous recherchez n'existe pas. Le chat vous ramène à la bonne place. 🐾</p>

      <div className={styles.imageWrapper}>
        <Link href={'/'}>
          <Image
            src={'/img/cat.png'}
            alt='Chat guide'
            width={300}
            height={300}
          />
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
