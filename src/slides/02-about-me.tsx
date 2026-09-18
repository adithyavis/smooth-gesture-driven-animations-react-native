import type { SlideDef } from '../deck/types';
import './about-me.css';

const PACKAGES = ['react-native-canvas-kit', 'reanimated-tab-view', 'awesome-mobile-app-animations'];

const DEMOS = [
  { src: '/videos/signature-pad.mp4', label: 'react-native-canvas-kit' },
  { src: '/videos/photos-scroller.mp4', label: 'awesome-mobile-app-animations' },
];

function AboutMe() {
  return (
    <div className="layout-about">
      <div className="about-text">
        <p className="eyebrow">About me</p>
        <h1>Adithya Viswamithiran</h1>
        <p className="role">
          Staff Software Engineer
          <span className="at">@</span>
          <img src="/levels-logo.svg" alt="Levels.fyi" className="company-logo" />
        </p>

        <h2>Open source</h2>
        <ul>
          {PACKAGES.map((name, i) => (
            <li key={name} style={{ animationDelay: `${160 + i * 90}ms` }}>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className="about-demos">
        {DEMOS.map(({ src, label }, i) => (
          <figure key={src} style={{ animationDelay: `${240 + i * 120}ms` }}>
            <video src={src} autoPlay muted loop playsInline />
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <AboutMe />,
};

export default slide;
