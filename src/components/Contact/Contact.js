'use client'
import SocialIcons from '../SocialIcons/SocialIcons'
import styles from './Contact.module.css'

export default function Contact() {
	return (
    <section id='contact' className={styles.contact}>
      <h2 className={styles.title}>Contact</h2>
      <p className={styles.textContent}>
        Discutons et echangeons de nos passions et construisons ensemble quelque
        chose de génial !
      </p>

      <SocialIcons width={25} height={25} />
    </section>
  );
}