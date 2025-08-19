import Projects from '../components/Projects/Projects'
import Contact from '../components/Contact/Contact'
import Loader from '@/components/Loader/Loader';
export default function Home() {
  return (
    <>
      <main>
        <Projects />
        <Contact />
      </main>
    </>
  );
}
